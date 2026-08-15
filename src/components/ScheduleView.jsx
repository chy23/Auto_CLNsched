import React, { useState } from 'react';
import * as XLSX from 'xlsx-js-style';

function ScheduleView({ schedule, setSchedule, students, settings }) {
  const [dragOverId, setDragOverId] = useState(null);

  if (!schedule) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--text-muted)' }}>尚未產生排班表</h3>
        <p>請先前往「設定區」設定名單與工作後，點擊「自動產生排班表」。</p>
      </div>
    );
  }

  // 1. Calculate unassigned students
  const allAssignedIds = schedule.assignments.flatMap(t => t.assignedStudents.map(s => String(s.id)));
  const chiefsAndDeputies = Object.values(schedule.areasInfo || {}).flatMap(info => [String(info.chiefId), String(info.deputyId)]).filter(Boolean);
  const unassignedStudents = students.filter(s => !allAssignedIds.includes(String(s.id)) && !chiefsAndDeputies.includes(String(s.id)));

  const handleRemoveStudent = (taskId, studentId) => {
    const newAssignments = schedule.assignments.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignedStudents: task.assignedStudents.filter(s => String(s.id) !== String(studentId))
        };
      }
      return task;
    });
    setSchedule({ ...schedule, assignments: newAssignments });
  };

  const onDragStart = (e, studentId, sourceTaskId) => {
    e.dataTransfer.setData("studentId", studentId);
    e.dataTransfer.setData("sourceTaskId", sourceTaskId || 'unassigned');
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e, id) => {
    e.preventDefault();
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const onDropToUnassigned = (e) => {
    e.preventDefault();
    setDragOverId(null);
    const studentId = e.dataTransfer.getData("studentId");
    const sourceTaskId = e.dataTransfer.getData("sourceTaskId");
    if (sourceTaskId !== 'unassigned') {
      handleRemoveStudent(parseInt(sourceTaskId, 10), studentId);
    }
  };

  const onDropToTask = (e, targetTaskId) => {
    e.preventDefault();
    setDragOverId(null);
    const studentId = e.dataTransfer.getData("studentId");
    const sourceTaskId = e.dataTransfer.getData("sourceTaskId");
    
    if (sourceTaskId === String(targetTaskId)) return;

    const studentToAdd = students.find(s => String(s.id) === String(studentId));
    if (!studentToAdd) return;

    let newAssignments = schedule.assignments;
    if (sourceTaskId !== 'unassigned') {
      newAssignments = newAssignments.map(task => {
        if (task.id === parseInt(sourceTaskId, 10)) {
          return { ...task, assignedStudents: task.assignedStudents.filter(s => String(s.id) !== String(studentId)) };
        }
        return task;
      });
    }

    newAssignments = newAssignments.map(task => {
      if (task.id === targetTaskId) {
        // Prevent duplicates
        if (!task.assignedStudents.find(s => String(s.id) === String(studentId))) {
          return { ...task, assignedStudents: [...task.assignedStudents, studentToAdd] };
        }
      }
      return task;
    });
    
    setSchedule({ ...schedule, assignments: newAssignments });
  };

  const handleAddStudent = (taskId, e) => {
    const studentId = e.target.value;
    if (!studentId) return;

    const studentToAdd = students.find(s => String(s.id) === String(studentId));
    if (!studentToAdd) return;

    const newAssignments = schedule.assignments.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignedStudents: [...task.assignedStudents, studentToAdd]
        };
      }
      return task;
    });
    setSchedule({ ...schedule, assignments: newAssignments });
    e.target.value = ''; // reset select
  };

  // Group by area
  const groupedTasks = schedule.assignments.reduce((acc, task) => {
    if (!acc[task.area]) acc[task.area] = [];
    acc[task.area].push(task);
    return acc;
  }, {});

  const exportToExcel = () => {
    const data = [];
    const merges = [];
    
    // Row 0: Title
    const titleParts = [];
    const semesterStr = settings.semester || '上學期';
    if (settings.year) titleParts.push(`${settings.year}學年度`);
    if (semesterStr) titleParts.push(semesterStr);
    if (settings.school) titleParts.push(settings.school);
    if (settings.grade && settings.classNo) {
      titleParts.push(`${settings.grade}年${settings.classNo}班`);
    } else if (settings.grade) {
      titleParts.push(`${settings.grade}年級`);
    } else if (settings.classNo) {
      titleParts.push(`${settings.classNo}班`);
    }
    titleParts.push('掃地工作表');
    const fullTitle = titleParts.join(' ');

    data.push([fullTitle]);
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });
    
    // Row 1: Rules
    data.push(['', '', '人數', settings.scheduleRules]);
    
    // Data rows
    let currentRow = 2;
    Object.keys(groupedTasks).forEach(area => {
      const areaInfo = schedule.areasInfo ? schedule.areasInfo[area] : null;
      let areaText = area;
      
      const tasksInArea = groupedTasks[area];
      
      tasksInArea.forEach((task, index) => {
        data.push([
          index === 0 ? areaText : '',
          `${index + 1} ${task.name}`,
          task.count,
          task.assignedStudents.map(s => `${s.no}${s.name}`).join(' , ')
        ]);
      });
      
      // Chief row
      if (areaInfo && (areaInfo.chiefName || areaInfo.deputyName)) {
        let chiefText = [];
        if (areaInfo.chiefName) chiefText.push(`股長：${areaInfo.chiefName}`);
        if (areaInfo.deputyName) chiefText.push(`代理股長：${areaInfo.deputyName}`);
        data.push([
          '',
          `${tasksInArea.length + 1} ${area}股長_檢查`,
          '1',
          chiefText.join(' , ')
        ]);
      }
      
      const totalRowsForArea = tasksInArea.length + (areaInfo && (areaInfo.chiefName || areaInfo.deputyName) ? 1 : 0);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + totalRowsForArea - 1, c: 0 } });
      
      currentRow += totalRowsForArea;
    });
    
    // Unassigned students section
    if (unassignedStudents.length > 0) {
      data.push([]);
      data.push(['未分配工作名單']);
      data.push([unassignedStudents.map(s => `${s.no}${s.name}`).join(' , ')]);
    }
    
    if (settings.extraNotes) {
      data.push([]);
      data.push(['備註：']);
      data.push([settings.extraNotes]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 10 }, // area
      { wch: 40 }, // task name
      { wch: 5 }, // count
      { wch: 40 } // students
    ];
    
    const rulesLines = (settings.scheduleRules || '').split('\n').length;
    ws['!rows'] = [];
    ws['!rows'][0] = { hpt: 30 };
    ws['!rows'][1] = { hpt: Math.max(50, rulesLines * 25 + 20) };
    
    if (settings.extraNotes) {
      const extraNotesLines = settings.extraNotes.split('\n').length;
      ws['!rows'][data.length - 1] = { hpt: Math.max(40, extraNotesLines * 20 + 20) };
    }

    const borderAll = {
      top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }
    };
    
    const maxRow = data.length;
    for (let R = 0; R < maxRow; ++R) {
      for (let C = 0; C < 4; ++C) {
        const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
        if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
        
        let cellStyle = {
          font: { name: "微軟正黑體", sz: 12 },
          alignment: { vertical: "center", horizontal: "center", wrapText: true },
          border: borderAll
        };
        
        if (R === 0) {
          cellStyle.font = { name: "微軟正黑體", sz: 16, bold: true };
        } else if (R === 1 && C === 3) {
          cellStyle.alignment = { vertical: "center", horizontal: "left", wrapText: true };
          cellStyle.font = { name: "微軟正黑體", sz: 10 };
        } else if (R >= 2 && C === 1) {
          cellStyle.alignment = { vertical: "center", horizontal: "left", wrapText: true };
        }
        
        ws[cellAddress].s = cellStyle;
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "總排班表");
    XLSX.writeFile(wb, `打掃總排班表_${schedule.date.replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ backgroundColor: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="no-print">
        <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>📅 掃地工作表 ({schedule.date})</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={exportToExcel}>📊 匯出總表 (Excel)</button>
          <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ 列印總表</button>
        </div>
      </div>

      {unassignedStudents.length > 0 && (
        <div 
          className="no-print" 
          style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            borderRadius: '8px', 
            transition: 'all 0.2s',
            backgroundColor: dragOverId === 'unassigned' ? '#fef3c7' : '#fef3c7', 
            border: dragOverId === 'unassigned' ? '2px dashed #f59e0b' : '1px dashed #f59e0b' 
          }}
          onDragOver={(e) => handleDragOver(e, 'unassigned')}
          onDragLeave={(e) => handleDragLeave(e, 'unassigned')}
          onDrop={onDropToUnassigned}
        >
          <h4 style={{ color: '#92400e', marginBottom: '0.5rem', marginTop: 0 }}>⚠️ 尚未分配工作的學生（備用名單）：</h4>
          <p style={{ fontSize: '0.8rem', color: '#b45309', margin: '0 0 0.5rem 0' }}>💡 您可以將這裡的學生拖曳到下方的打掃範圍，或將下方的學生拖曳回這裡。</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {unassignedStudents.map(s => {
              const isLate = s.arrival === '晚到';
              const bgColor = isLate ? '#ffedd5' : '#dcfce7'; // orange-100 or green-100
              const borderColor = isLate ? '#fdba74' : '#86efac'; // orange-300 or green-300
              const textColor = isLate ? '#c2410c' : '#166534'; // orange-700 or green-800
              
              return (
                <span 
                  key={s.id} 
                  draggable
                  onDragStart={(e) => onDragStart(e, s.id, 'unassigned')}
                  style={{ 
                    backgroundColor: bgColor, padding: '0.2rem 0.5rem', borderRadius: '4px', 
                    border: `1px solid ${borderColor}`, color: textColor, fontSize: '0.9rem', cursor: 'grab' 
                  }}
                >
                  {s.no}{s.name} ({s.gender}) - {s.arrival || '早到'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="print-header no-print" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2>
          {[
            settings.year ? `${settings.year}學年度` : '', 
            settings.semester || '上學期', 
            settings.school, 
            (settings.grade && settings.classNo) ? `${settings.grade}年${settings.classNo}班` : 
              (settings.grade ? `${settings.grade}年級` : (settings.classNo ? `${settings.classNo}班` : '')),
            '掃地工作表'
          ].filter(Boolean).join(' ')}
        </h2>
      </div>

      <div className="table-container" style={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <table className="table print-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead className="print-only" style={{ display: 'none' }}>
            <tr>
              <th colSpan="4" style={{ textAlign: 'center', fontSize: '1.5rem', border: '1px solid black', padding: '10px' }}>
                {[
                  settings.year ? `${settings.year}學年度` : '', 
                  settings.semester || '上學期', 
                  settings.school, 
                  (settings.grade && settings.classNo) ? `${settings.grade}年${settings.classNo}班` : 
                    (settings.grade ? `${settings.grade}年級` : (settings.classNo ? `${settings.classNo}班` : '')),
                  '掃地工作表'
                ].filter(Boolean).join(' ')}
              </th>
            </tr>
            <tr>
              <th style={{ border: '1px solid black' }}></th>
              <th style={{ border: '1px solid black' }}></th>
              <th style={{ border: '1px solid black', textAlign: 'center' }}>人數</th>
              <th style={{ border: '1px solid black', textAlign: 'left', whiteSpace: 'pre-wrap', fontWeight: 'normal', fontSize: '0.85rem' }}>
                {settings.scheduleRules}
              </th>
            </tr>
          </thead>
          <thead className="screen-only">
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ width: '15%', borderRight: '1px solid #e5e7eb' }}>掃區</th>
              <th style={{ width: '35%' }}>打掃範圍</th>
              <th style={{ width: '10%', textAlign: 'center' }}>人數</th>
              <th style={{ width: '40%' }}>負責同學 (可手動微調)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedTasks).map((area, areaIndex) => {
              const tasksInArea = groupedTasks[area];
              const areaInfo = schedule.areasInfo ? schedule.areasInfo[area] : null;
              const hasChief = areaInfo && (areaInfo.chiefName || areaInfo.deputyName);
              const totalRows = tasksInArea.length + (hasChief ? 1 : 0);
              
              return (
                <React.Fragment key={area}>
                  {tasksInArea.map((task, index) => (
                    <tr key={task.id}>
                      {index === 0 && (
                        <td 
                          rowSpan={totalRows} 
                          className="print-cell"
                          style={{ 
                            borderRight: '1px solid #e5e7eb', 
                            borderBottom: '1px solid #e5e7eb',
                            verticalAlign: 'top', 
                            textAlign: 'center',
                            backgroundColor: areaIndex % 2 === 0 ? '#e0f2fe' : '#fce7f3',
                            padding: '1rem 0.5rem'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{area}</div>
                          {areaInfo && areaInfo.chiefName && (
                            <div className="no-print" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.2rem' }}>
                              <span style={{ border: '1px solid currentColor', borderRadius: '4px', padding: '0 2px', marginRight: '4px' }}>股長</span>
                              {areaInfo.chiefName}
                            </div>
                          )}
                          {areaInfo && areaInfo.deputyName && (
                            <div className="no-print" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              <span style={{ border: '1px solid currentColor', borderRadius: '4px', padding: '0 2px', marginRight: '4px' }}>代理</span>
                              {areaInfo.deputyName}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="print-cell" style={{ borderBottom: '1px solid #e5e7eb' }}>{task.name}</td>
                      <td className="print-cell" style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>{task.count}</td>
                      <td className="print-cell" style={{ borderBottom: '1px solid #e5e7eb', padding: 0 }}>
                        <div 
                          style={{ 
                            display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', 
                            minHeight: '100%', padding: '1rem', transition: 'all 0.2s',
                            backgroundColor: dragOverId === task.id ? '#fef3c7' : 'transparent'
                          }}
                          onDragOver={(e) => handleDragOver(e, task.id)}
                          onDragLeave={(e) => handleDragLeave(e, task.id)}
                          onDrop={(e) => onDropToTask(e, task.id)}
                        >
                          {task.assignedStudents.map(s => (
                            <div 
                              key={s.id} 
                              className="student-chip" 
                              draggable
                              onDragStart={(e) => onDragStart(e, s.id, task.id)}
                              style={{ 
                                display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', 
                                padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.9rem', 
                                border: '1px solid #e5e7eb', cursor: 'grab'
                              }}
                            >
                              <span>{s.no}{s.name}</span>
                              <button 
                                className="no-print"
                                onClick={() => handleRemoveStudent(task.id, s.id)}
                                style={{ 
                                  background: 'transparent', border: 'none', color: '#ef4444', 
                                  marginLeft: '0.3rem', cursor: 'pointer', fontWeight: 'bold', padding: '0 0.2rem'
                                }}
                                title="移除"
                              >×</button>
                            </div>
                          ))}
                          <select 
                            className="no-print form-control" 
                            style={{ width: 'auto', padding: '0.1rem 0.5rem', fontSize: '0.85rem', borderRadius: '12px', borderColor: '#d1d5db' }}
                            onChange={(e) => handleAddStudent(task.id, e)}
                            value=""
                          >
                            <option value="" disabled>+ 新增</option>
                            {unassignedStudents.map(s => (
                              <option key={s.id} value={s.id}>{s.no}{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Chief Row added for UI and Print consistency with Excel */}
                  {hasChief && (
                    <tr className="print-cell">
                      <td className="print-cell" style={{ borderBottom: '1px solid #e5e7eb' }}>
                        {tasksInArea.length + 1} {area}股長_檢查
                      </td>
                      <td className="print-cell" style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>1</td>
                      <td className="print-cell" style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {areaInfo.chiefName && (
                            <span className="student-chip" style={{ backgroundColor: '#fce7f3', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #fbcfe8', color: '#be185d' }}>
                              股長：{areaInfo.chiefName}
                            </span>
                          )}
                          {areaInfo.deputyName && (
                            <span className="student-chip" style={{ backgroundColor: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #bae6fd', color: '#0369a1' }}>
                              代理股長：{areaInfo.deputyName}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="no-print" style={{ marginTop: '2rem', fontSize: '0.9rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap' }}>
        {settings.scheduleRules}
      </div>
      
      {settings.extraNotes && (
        <div className="print-extra-notes" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap', backgroundColor: '#f9fafb' }}>
          <strong>備註：</strong><br />
          {settings.extraNotes}
        </div>
      )}
    </div>
  );
}

export default ScheduleView;

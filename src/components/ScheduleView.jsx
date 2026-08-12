import * as XLSX from 'xlsx';

function ScheduleView({ schedule, setSchedule, students }) {
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
    data.push(['麗園國小掃地工作表']);
    merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });
    
    // Row 1: Rules
    const rules = "時段一：早上打掃時段\n（外掃：請於7:50離開掃區回班級。）\n未完成打掃請在大下課補完成\n時段二：掃地時間\n週一二四五14:50~15:10 周三10:10~10:30\n（請詳細完成掃地工作，並於掃地時間結束前3分鐘返回班級）";
    data.push(['', '', '人數', rules]);
    
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

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!merges'] = merges;
    ws['!cols'] = [
      { wch: 10 }, // area
      { wch: 40 }, // task name
      { wch: 5 }, // count
      { wch: 40 } // students
    ];

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
        <div className="no-print" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <h4 style={{ color: '#92400e', marginBottom: '0.5rem', marginTop: 0 }}>⚠️ 尚未分配工作的學生（備用名單）：</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {unassignedStudents.map(s => (
              <span key={s.id} style={{ backgroundColor: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #fcd34d', fontSize: '0.9rem' }}>
                {s.no}{s.name} ({s.gender})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="print-header" style={{ display: 'none', textAlign: 'center', marginBottom: '1rem' }}>
        <h2>掃地工作表</h2>
      </div>

      <div className="table-container" style={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <table className="table" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ width: '15%', borderRight: '1px solid #e5e7eb' }}>掃區</th>
              <th style={{ width: '35%' }}>打掃範圍</th>
              <th style={{ width: '10%', textAlign: 'center' }}>人數</th>
              <th style={{ width: '40%' }}>負責同學 (可手動微調)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedTasks).map((area, areaIndex) => (
              groupedTasks[area].map((task, index) => {
                const areaInfo = schedule.areasInfo ? schedule.areasInfo[area] : null;
                return (
                  <tr key={task.id}>
                    {index === 0 && (
                      <td 
                        rowSpan={groupedTasks[area].length} 
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
                          <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.2rem' }}>
                            <span style={{ border: '1px solid currentColor', borderRadius: '4px', padding: '0 2px', marginRight: '4px' }}>股長</span>
                            {areaInfo.chiefName}
                          </div>
                        )}
                        {areaInfo && areaInfo.deputyName && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span style={{ border: '1px solid currentColor', borderRadius: '4px', padding: '0 2px', marginRight: '4px' }}>代理</span>
                            {areaInfo.deputyName}
                          </div>
                        )}
                      </td>
                    )}
                    <td style={{ borderBottom: '1px solid #e5e7eb' }}>{task.name}</td>
                    <td style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>{task.count}</td>
                    <td style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        {task.assignedStudents.map(s => (
                          <div key={s.id} className="student-chip" style={{ 
                            display: 'flex', alignItems: 'center', backgroundColor: '#f3f4f6', 
                            padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.9rem', border: '1px solid #e5e7eb'
                          }}>
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
                );
              })
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '0.9rem' }}>
        <div style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>時段一：早上打掃時段</h4>
          <p>（外掃：請於7:50離開掃區回班級。）</p>
          <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>未完成打掃請在大下課補完成</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>時段二：掃地時間</h4>
          <p>週一二四五 14:50~15:10，週三 10:10~10:30</p>
          <p>（請詳細完成掃地工作，並於結束前3分鐘返回班級）</p>
        </div>
      </div>
    </div>
  );
}

export default ScheduleView;

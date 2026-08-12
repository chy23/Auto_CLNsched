import * as XLSX from 'xlsx-js-style';

function ChecklistView({ schedule, settings }) {
  if (!schedule) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--text-muted)' }}>尚未產生排班表</h3>
        <p>請先前往「設定區」產生排班表後，才能檢視檢核表。</p>
      </div>
    );
  }

  // Create columns for dates (empty columns for the checklist)
  const columns = Array.from({ length: 25 }, (_, i) => i + 1);

  // Group by area
  const groupedTasks = schedule.assignments.reduce((acc, task) => {
    if (!acc[task.area]) acc[task.area] = [];
    acc[task.area].push(task);
    return acc;
  }, {});

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    Object.keys(groupedTasks).forEach(area => {
      const data = [];
      const merges = [];
      
      const areaInfo = schedule.areasInfo ? schedule.areasInfo[area] : null;
      let chiefStr = '';
      if (areaInfo && areaInfo.chiefName) chiefStr += `股長：${areaInfo.chiefName} `;
      if (areaInfo && areaInfo.deputyName) chiefStr += `【代理股長：${areaInfo.deputyName}】`;
      
      // Row 0: Title
      const titleParts = [];
      if (settings.year) titleParts.push(`${settings.year}學年度`);
      if (settings.semester) titleParts.push(settings.semester);
      if (settings.school) titleParts.push(settings.school);
      if (settings.className) titleParts.push(settings.className);
      titleParts.push(`掃地工作檢核表 - ${area}    ${chiefStr}`);
      const fullTitle = titleParts.join(' ');

      data.push([fullTitle]);
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length + 1 } });
      
      // Row 1: 打掃範圍 & Rules
      data.push(['打掃範圍', '', settings.checklistRules]);
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }); // 打掃範圍 spans 2 cols
      merges.push({ s: { r: 1, c: 2 }, e: { r: 1, c: columns.length + 1 } }); // rules spans remaining cols
      
      // Row 2: Headers
      const headerRow = ['日期\n(e.g.9/1早、9/1下午)', '', '姓名', ...columns.map(c => '')];
      data.push(headerRow);
      merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }); // 日期 spans 2 cols
      
      // Data rows
      let currentRow = 3;
      groupedTasks[area].forEach((task, index) => {
        const studentsCount = Math.max(1, task.assignedStudents.length);
        
        for (let i = 0; i < studentsCount; i++) {
          const row = [];
          if (i === 0) {
            row.push(`${index + 1}`);
            row.push(task.name);
          } else {
            row.push('');
            row.push('');
          }
          
          const student = task.assignedStudents[i];
          row.push(student ? `${student.no}${student.name}` : '');
          
          columns.forEach(() => row.push('')); // empty checkbox cells
          data.push(row);
        }
        
        if (studentsCount > 1) {
          merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + studentsCount - 1, c: 0 } });
          merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow + studentsCount - 1, c: 1 } });
        }
        
        currentRow += studentsCount;
      });
      
      if (settings.extraNotes) {
        data.push([]);
        data.push(['備註：', settings.extraNotes]);
        merges.push({ s: { r: currentRow + 1, c: 1 }, e: { r: currentRow + 1, c: columns.length + 1 } });
      }
      
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!merges'] = merges;
      ws['!cols'] = [
        { wch: 5 }, // index
        { wch: 40 }, // task name
        { wch: 15 }, // student name
        ...columns.map(() => ({ wch: 5 })) // checkboxes
      ];
      
      const rulesLines = (settings.checklistRules || '').split('\n').length;
      ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 30 };
      ws['!rows'][1] = { hpt: Math.max(30, rulesLines * 16 + 10) };
      
      if (settings.extraNotes) {
        const extraNotesLines = settings.extraNotes.split('\n').length;
        ws['!rows'][data.length - 1] = { hpt: Math.max(30, extraNotesLines * 16 + 10) };
      }

      const borderAll = {
        top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }
      };
      
      for (let R = 0; R < currentRow; ++R) {
        for (let C = 0; C < columns.length + 3; ++C) {
          const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
          if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };
          
          let cellStyle = {
            font: { name: "微軟正黑體", sz: 12 },
            alignment: { vertical: "center", horizontal: "center", wrapText: true },
            border: borderAll
          };
          
          if (R === 0) {
            cellStyle.font = { name: "微軟正黑體", sz: 16, bold: true };
          } else if (R === 1 && C >= 2) {
            cellStyle.alignment = { vertical: "center", horizontal: "left", wrapText: true };
            cellStyle.font = { name: "微軟正黑體", sz: 10 };
          } else if (R >= 3 && C === 1) {
            cellStyle.alignment = { vertical: "center", horizontal: "left", wrapText: true };
          }
          
          ws[cellAddress].s = cellStyle;
        }
      }

      const sheetName = area.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    XLSX.writeFile(wb, `掃地工作檢核表_${schedule.date.replace(/\//g, '-')}.xlsx`);
  };

  return (
    <div className="glass-card animate-fade-in" style={{ backgroundColor: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }} className="no-print">
        <h2 style={{ color: 'var(--secondary-color)', margin: 0 }}>✅ 掃地工作檢核表</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={exportToExcel}>📊 匯出檢核表 (Excel)</button>
          <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ 列印檢核表</button>
        </div>
      </div>

      {Object.keys(groupedTasks).map(area => (
        <div key={area} style={{ pageBreakInside: 'avoid', marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>{[settings.year ? `${settings.year}學年度` : '', settings.semester, settings.school, settings.className, `掃地工作檢核表 - ${area}`].filter(Boolean).join(' ')}</h3>
          </div>
          
          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
            {settings.checklistRules}
          </div>

          <div className="table-container" style={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
            <table className="table" style={{ borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ width: '40%', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>打掃範圍</th>
                  <th style={{ width: '20%', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>姓名</th>
                  {columns.map(c => (
                    <th key={c} style={{ width: '4%', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedTasks[area].map((task, index) => (
                  <tr key={task.id}>
                    <td style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>{index + 1}. {task.name}</td>
                    <td style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
                      {task.assignedStudents.map(s => `${s.no}${s.name}`).join(' , ')}
                    </td>
                    {columns.map(c => (
                      <td key={c} style={{ borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {settings.extraNotes && (
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap', backgroundColor: '#f9fafb' }}>
              <strong>備註：</strong> {settings.extraNotes}
            </div>
          )}
        </div>
      ))}
      
      <style>{`
        @media print {
          @page { size: landscape; margin: 1cm; }
          .glass-card { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

export default ChecklistView;

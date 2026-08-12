import * as XLSX from 'xlsx';

function ChecklistView({ schedule }) {
  if (!schedule) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--text-muted)' }}>尚未產生排班表</h3>
        <p>請先前往「設定區」產生排班表後，才能檢視檢核表。</p>
      </div>
    );
  }

  // Create columns for dates (empty columns for the checklist)
  const columns = Array.from({ length: 10 }, (_, i) => i + 1);

  const exportToExcel = () => {
    const data = [];
    
    // Header
    const headerRow = ['打掃範圍', '姓名', ...columns.map(c => '')];
    data.push(headerRow);
    
    // Data rows
    schedule.assignments.forEach((task, index) => {
      data.push([
        `${index + 1}. ${task.name}`,
        task.assignedStudents.map(s => `${s.no}${s.name}`).join(' , '),
        ...columns.map(c => '')
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "檢核表");
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

      <div style={{ pageBreakInside: 'avoid' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>掃地工作檢核表</h3>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>* ✔️ 完成打掃</span>
          <span>* ○ 打掃時間嬉鬧</span>
          <span>* ❌ 未完成打掃</span>
          <span>* △ 打掃不確實</span>
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
              {schedule.assignments.map((task, index) => (
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
      </div>
      
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

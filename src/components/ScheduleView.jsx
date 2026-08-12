import * as XLSX from 'xlsx';

function ScheduleView({ schedule }) {
  if (!schedule) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ color: 'var(--text-muted)' }}>尚未產生排班表</h3>
        <p>請先前往「設定區」設定名單與工作後，點擊「自動產生排班表」。</p>
      </div>
    );
  }

  // Group by area
  const groupedTasks = schedule.assignments.reduce((acc, task) => {
    if (!acc[task.area]) acc[task.area] = [];
    acc[task.area].push(task);
    return acc;
  }, {});

  const exportToExcel = () => {
    const data = [];
    data.push(['掃區', '打掃範圍', '人數', '負責同學']);
    
    Object.keys(groupedTasks).forEach(area => {
      const areaInfo = schedule.areasInfo ? schedule.areasInfo[area] : null;
      let areaText = area;
      if (areaInfo && areaInfo.chiefName) areaText += ` (股長:${areaInfo.chiefName})`;
      if (areaInfo && areaInfo.deputyName) areaText += ` (代理:${areaInfo.deputyName})`;
      
      groupedTasks[area].forEach((task, index) => {
        data.push([
          index === 0 ? areaText : '',
          task.name,
          task.count,
          task.assignedStudents.map(s => `${s.no}${s.name}`).join(' , ')
        ]);
      });
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
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

      <div className="print-header" style={{ display: 'none', textAlign: 'center', marginBottom: '1rem' }}>
        <h2>掃地工作表</h2>
      </div>

      <div className="table-container" style={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
        <table className="table" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ width: '15%', borderRight: '1px solid #e5e7eb' }}>掃區</th>
              <th style={{ width: '40%' }}>打掃範圍</th>
              <th style={{ width: '10%', textAlign: 'center' }}>人數</th>
              <th style={{ width: '35%' }}>負責同學</th>
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
                      {task.assignedStudents.map(s => `${s.no}${s.name}`).join(' , ')}
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

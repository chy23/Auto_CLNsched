import { useState } from 'react';

function AreaManager({ areas, setAreas, students }) {
  const [newArea, setNewArea] = useState('');

  const handleAddArea = (e) => {
    e.preventDefault();
    if (newArea.trim() && !areas.find(a => a.name === newArea.trim())) {
      setAreas([...areas, { id: Date.now(), name: newArea.trim(), chief: '', deputy: '' }]);
      setNewArea('');
    }
  };

  const handleRemoveArea = (id) => {
    setAreas(areas.filter(a => a.id !== id));
  };

  const handleUpdateChief = (id, field, studentId) => {
    setAreas(areas.map(a => {
      if (a.id === id) {
        return { ...a, [field]: studentId };
      }
      return a;
    }));
  };

  const assignedChiefsAndDeputies = areas.flatMap(a => [a.chief, a.deputy]).filter(Boolean).map(String);

  const isStudentSelectable = (studentId, currentValue) => {
    if (String(studentId) === String(currentValue)) return true;
    return !assignedChiefsAndDeputies.includes(String(studentId));
  };

  return (
    <div className="glass-card">
      <h2 style={{ color: 'var(--primary-color)' }}>🏷️ 掃區與股長管理</h2>
      
      <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>新增掃區</h4>
        <form onSubmit={handleAddArea} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            className="form-control" 
            type="text" 
            placeholder="掃區名稱 (例如：教室掃區)" 
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            required 
          />
          <button type="submit" className="btn btn-primary">+</button>
        </form>
      </div>

      <div className="table-container" style={{ maxHeight: '300px' }}>
        <table className="table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>掃區名稱</th>
              <th>股長 (不參與打掃)</th>
              <th>代理股長 (強制排入該區)</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area.id}>
                <td style={{ fontWeight: 'bold' }}>{area.name}</td>
                <td>
                  <select 
                    className="form-control" 
                    value={area.chief} 
                    onChange={(e) => handleUpdateChief(area.id, 'chief', e.target.value)}
                    style={{ padding: '0.3rem' }}
                  >
                    <option value="">-- 無 --</option>
                    {students.map(s => (
                      isStudentSelectable(s.id, area.chief) && <option key={s.id} value={s.id}>{s.no} {s.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select 
                    className="form-control" 
                    value={area.deputy} 
                    onChange={(e) => handleUpdateChief(area.id, 'deputy', e.target.value)}
                    style={{ padding: '0.3rem' }}
                  >
                    <option value="">-- 無 --</option>
                    {students.map(s => (
                      isStudentSelectable(s.id, area.deputy) && <option key={s.id} value={s.id}>{s.no} {s.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem' }} onClick={() => handleRemoveArea(area.id)}>刪</button>
                </td>
              </tr>
            ))}
            {areas.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無掃區，請新增</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AreaManager;

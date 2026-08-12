import { useState } from 'react';

function TaskManager({ tasks, setTasks }) {
  const handleAddTask = (e) => {
    e.preventDefault();
    const area = e.target.area.value;
    const name = e.target.name.value;
    const count = e.target.count.value;
    const genderReq = e.target.genderReq.value;
    
    if (area && name && count) {
      setTasks([...tasks, { id: Date.now(), area, name, count, genderReq }]);
      e.target.name.value = '';
      e.target.count.value = '';
    }
  };

  const handleRemove = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const loadDefaults = () => {
    const defaultTasks = [
      { id: 1, area: '外掃區', name: '活動中心北側紅磚及無障礙坡', count: 3, genderReq: '無' },
      { id: 2, area: '外掃區', name: '活動中心東側紅磚、花圃', count: 3, genderReq: '無' },
      { id: 3, area: '外掃區', name: '活動中心泳池出口之樓梯B1~4F', count: 2, genderReq: '無' },
      { id: 4, area: '外掃區', name: '外掃股長_檢查外掃', count: 1, genderReq: '無' },
      { id: 5, area: '教室掃區', name: '黑板整理', count: 1, genderReq: '無' },
      { id: 6, area: '教室掃區', name: '教室桌椅、各項物品排整齊', count: 1, genderReq: '無' },
      { id: 7, area: '教室掃區', name: '廁所男生', count: 2, genderReq: '限男生' },
      { id: 8, area: '教室掃區', name: '廁所女生', count: 2, genderReq: '限女生' },
      { id: 9, area: '教室掃區', name: '倒垃圾', count: 1, genderReq: '無' },
    ];
    setTasks(defaultTasks);
  };

  return (
    <div className="glass-card">
      <h2 style={{ color: 'var(--secondary-color)' }}>🧹 掃區與工作設定</h2>
      
      <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>新增打掃工作</h4>
        <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <select name="area" className="form-control" required>
            <option value="教室掃區">教室掃區</option>
            <option value="外掃區">外掃區</option>
          </select>
          <input name="name" className="form-control" type="text" placeholder="工作名稱" required />
          <input name="count" className="form-control" type="number" placeholder="人數" min="1" required />
          <select name="genderReq" className="form-control" required>
            <option value="無">性別不限</option>
            <option value="限男生">限男生</option>
            <option value="限女生">限女生</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>新增工作</button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span>共 {tasks.length} 項工作 (需 {tasks.reduce((sum, t) => sum + parseInt(t.count), 0)} 人)</span>
        <div>
          <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={loadDefaults}>載入範例</button>
          {tasks.length > 0 && (
            <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setTasks([])}>清空</button>
          )}
        </div>
      </div>

      <div className="table-container" style={{ maxHeight: '300px' }}>
        <table className="table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>區域</th>
              <th>名稱</th>
              <th>人數</th>
              <th>限制</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td>{t.area}</td>
                <td>{t.name}</td>
                <td>{t.count}</td>
                <td>{t.genderReq}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem' }} onClick={() => handleRemove(t.id)}>刪</button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無工作設定</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskManager;

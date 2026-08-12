import { useState } from 'react';

function StudentManager({ students, setStudents }) {
  const [inputData, setInputData] = useState('');

  const handleAddRow = (e) => {
    e.preventDefault();
    const no = e.target.no.value;
    const name = e.target.name.value;
    const gender = e.target.gender.value;
    if (no && name && gender) {
      setStudents([...students, { id: Date.now(), no, name, gender }]);
      e.target.reset();
    }
  };

  const handleRemove = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleBulkImport = () => {
    // Basic CSV/Text parsing: each line "No Name Gender"
    const lines = inputData.split('\n');
    const newStudents = [];
    lines.forEach(line => {
      const parts = line.trim().split(/[\s,]+/);
      if (parts.length >= 3) {
        newStudents.push({
          id: Date.now() + Math.random(),
          no: parts[0],
          name: parts[1],
          gender: parts[2]
        });
      }
    });

    if (newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      setInputData('');
      alert(`成功匯入 ${newStudents.length} 筆資料`);
    } else {
      alert('無法解析格式，請確認格式為：座號 姓名 性別（中間以空白或逗號分隔）');
    }
  };

  return (
    <div className="glass-card">
      <h2 style={{ color: 'var(--primary-color)' }}>👥 學生名單管理</h2>
      
      <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>批次匯入 (座號 姓名 性別)</h4>
        <textarea 
          className="form-control" 
          rows="4" 
          placeholder={`範例：\n1 王大明 男\n2 陳小華 女`}
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          style={{ marginBottom: '0.5rem' }}
        ></textarea>
        <button className="btn btn-secondary" onClick={handleBulkImport}>匯入名單</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleAddRow} style={{ display: 'flex', gap: '0.5rem' }}>
          <input name="no" className="form-control" type="number" placeholder="座號" required style={{ width: '80px' }} />
          <input name="name" className="form-control" type="text" placeholder="姓名" required />
          <select name="gender" className="form-control" required style={{ width: '80px' }}>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
          <button type="submit" className="btn btn-primary">+</button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span>共 {students.length} 人</span>
        {students.length > 0 && (
          <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setStudents([])}>清空名單</button>
        )}
      </div>

      <div className="table-container" style={{ maxHeight: '300px' }}>
        <table className="table">
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>座號</th>
              <th>姓名</th>
              <th>性別</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {students.sort((a, b) => parseInt(a.no) - parseInt(b.no)).map(s => (
              <tr key={s.id}>
                <td>{s.no}</td>
                <td>{s.name}</td>
                <td>{s.gender}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem' }} onClick={() => handleRemove(s.id)}>刪</button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>尚無學生資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentManager;

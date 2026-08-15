import { useState, useRef } from 'react';
import * as XLSX from 'xlsx-js-style';

function StudentManager({ students, setStudents }) {
  const [inputData, setInputData] = useState('');
  const fileInputRef = useRef(null);

  const handleAddRow = (e) => {
    e.preventDefault();
    const no = e.target.no.value;
    const name = e.target.name.value;
    const gender = e.target.gender.value;
    const arrival = e.target.arrival.value;
    if (no && name && gender) {
      const safeId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
      setStudents([...students, { id: safeId, no, name, gender, arrival }]);
      e.target.reset();
    }
  };

  const handleRemove = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const updateArrival = (id, newArrival) => {
    setStudents(students.map(s => s.id === id ? { ...s, arrival: newArrival } : s));
  };

  const handleBulkImport = () => {
    const lines = inputData.split('\n');
    const newStudents = [];
    lines.forEach(line => {
      const parts = line.trim().split(/[\s,]+/);
      if (parts.length >= 3) {
        const safeId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9) + '-' + newStudents.length;
        newStudents.push({
          id: safeId,
          no: parts[0],
          name: parts[1],
          gender: parts[2],
          arrival: parts[3] || '早到'
        });
      }
    });

    if (newStudents.length > 0) {
      setStudents([...students, ...newStudents]);
      setInputData('');
      alert(`成功匯入 ${newStudents.length} 筆資料`);
    } else {
      alert('無法解析格式，請確認格式為：座號 姓名 性別 [到校時間]');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const newStudents = [];
        let startIndex = 0;
        if (data[0] && (data[0][0] === '座號' || data[0][1] === '姓名')) {
          startIndex = 1;
        }

        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (row && row.length >= 3 && row[0] && row[1] && row[2]) {
            const safeId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9) + '-' + i;
            newStudents.push({
              id: safeId,
              no: String(row[0]),
              name: String(row[1]),
              gender: String(row[2]).trim(),
              arrival: row[3] ? String(row[3]).trim() : '早到'
            });
          }
        }

        if (newStudents.length > 0) {
          setStudents([...students, ...newStudents]);
          alert(`成功從 Excel 匯入 ${newStudents.length} 筆資料`);
        } else {
          alert('Excel 內沒有找到有效資料，請確保前三欄為：座號、姓名、性別');
        }
      } catch (err) {
        alert('解析 Excel 失敗，請確認檔案格式是否正確。');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="glass-card">
      <h2 style={{ color: 'var(--primary-color)' }}>👥 學生名單管理</h2>
      
      <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Excel / 批次匯入</h4>
        
        <div style={{ marginBottom: '1rem' }}>
          <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer' }}>
            📁 點擊上傳 Excel 檔案 (.xlsx, .csv)
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
              ref={fileInputRef}
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        <h5 style={{ margin: '0.5rem 0', color: 'var(--text-muted)' }}>或手動貼上 (座號 姓名 性別 [到校時間])：</h5>
        <textarea 
          className="form-control" 
          rows="3" 
          placeholder={`範例：\n1 王大明 男 早到\n2 陳小華 女 早到\n3 林小美 女 晚到`}
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          style={{ marginBottom: '0.5rem' }}
        ></textarea>
        <button className="btn btn-secondary" onClick={handleBulkImport}>文字匯入名單</button>
      </div>

      <h2 style={{ color: 'var(--primary-color)' }}>🧑‍🎓 學生名單</h2>
      
      <div className="form-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="座號 (e.g. 01)" 
          value={newStudent.no} 
          onChange={e => setNewStudent({...newStudent, no: e.target.value})}
          style={{ width: '80px' }}
          onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
        />
        <input 
          type="text" 
          className="form-control" 
          placeholder="姓名" 
          value={newStudent.name} 
          onChange={e => setNewStudent({...newStudent, name: e.target.value})}
          style={{ flex: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
        />
        <select 
          className="form-control" 
          value={newStudent.gender} 
          onChange={e => setNewStudent({...newStudent, gender: e.target.value})}
          style={{ width: '80px' }}
        >
          <option value="男">男</option>
          <option value="女">女</option>
        </select>
        <button className="btn btn-primary" onClick={handleAddStudent}>新增</button>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed #ccc' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>目前還沒有學生名單喔！</h4>
            <p style={{ fontSize: '0.9rem' }}>請在上方輸入座號與姓名，開始建立您的班級名單。</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>共 {students.length} 人</span>
              {students.length > 0 && (
                <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setStudents([])}>清空名單</button>
              )}
            </div>
            {[...students].sort((a, b) => parseInt(a.no) - parseInt(b.no)).map(student => (
              <div key={student.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: '#fff', borderRadius: '4px', border: '1px solid #eee' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>{student.no}</strong>
                  <span>{student.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>({student.gender})</span>
                </div>
                <div>
                  <select 
                    value={student.arrival || '早到'} 
                    onChange={(e) => updateArrival(student.id, e.target.value)}
                    style={{ padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="早到">早到</option>
                    <option value="晚到">晚到</option>
                  </select>
                </div>
                <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', alignSelf: 'center' }} onClick={() => handleRemove(student.id)}>刪除</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentManager;

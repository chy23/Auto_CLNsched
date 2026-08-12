import React from 'react';

function SettingsManager({ settings, setSettings, students, setStudents, tasks, setTasks, areas, setAreas }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = () => {
    const data = { students, tasks, areas, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `掃地排班系統備份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.students) setStudents(data.students);
        if (data.tasks) setTasks(data.tasks);
        if (data.areas) setAreas(data.areas);
        if (data.settings) setSettings(data.settings);
        alert('✅ 設定檔匯入成功！');
      } catch (err) {
        alert('❌ 檔案格式錯誤，匯入失敗。');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  return (
    <div className="glass-card" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>⚙️ 報表文字與備註設定</h2>
        
        {/* Export / Import Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleExport} style={{ fontSize: '0.9rem' }}>
            💾 備份系統資料
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '0.9rem', margin: 0 }}>
            📂 還原系統資料
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>學年</h4>
            <input type="text" name="year" className="form-control" value={settings.year || ''} onChange={handleChange} placeholder="e.g. 112" />
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>學期</h4>
            <select name="semester" className="form-control" value={settings.semester || '上學期'} onChange={handleChange}>
              <option value="上學期">上</option>
              <option value="下學期">下</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>學校名稱</h4>
            <input type="text" name="school" className="form-control" value={settings.school || ''} onChange={handleChange} placeholder="e.g. 國小" />
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>年級</h4>
            <select name="grade" className="form-control" value={settings.grade || ''} onChange={handleChange}>
              <option value="">(無)</option>
              {['一', '二', '三', '四', '五', '六'].map(g => <option key={g} value={g}>{g}年級</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '100px' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>班級</h4>
            <select name="classNo" className="form-control" value={settings.classNo || ''} onChange={handleChange}>
              <option value="">(無)</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(c => <option key={c} value={c}>{c}班</option>)}
            </select>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>總排班表 - 規定文字</h4>
          <textarea 
            name="scheduleRules"
            className="form-control"
            rows="6"
            value={settings.scheduleRules}
            onChange={handleChange}
            style={{ width: '100%', resize: 'vertical' }}
          ></textarea>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>檢核表 - 評分規則</h4>
          <textarea 
            name="checklistRules"
            className="form-control"
            rows="6"
            value={settings.checklistRules}
            onChange={handleChange}
            style={{ width: '100%', resize: 'vertical' }}
          ></textarea>
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>額外備註 (將匯出於所有報表最下方)</h4>
          <textarea 
            name="extraNotes"
            className="form-control"
            rows="3"
            placeholder="例如：請導師協助督導...等 (不填寫則不顯示)"
            value={settings.extraNotes}
            onChange={handleChange}
            style={{ width: '100%', resize: 'vertical' }}
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default SettingsManager;

import React from 'react';

function SettingsManager({ settings, setSettings }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="glass-card" style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
      <h2 style={{ color: 'var(--primary-color)' }}>⚙️ 報表文字與備註設定</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
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

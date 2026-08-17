import React, { useState, useRef } from 'react';

function ExportImportModal({ isOpen, onClose, appData, setAppData, showToast }) {
  const [mode, setMode] = useState('export'); // 'export' or 'import'
  const [exportOptions, setExportOptions] = useState({
    students: true,
    areas: true,
    tasks: true,
    settings: true
  });

  const [importedData, setImportedData] = useState(null);
  const [importOptions, setImportOptions] = useState({
    students: true,
    areas: true,
    tasks: true,
    settings: true
  });
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleExportToggle = (key) => {
    setExportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImportToggle = (key) => {
    setImportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () => {
    const dataToExport = {};
    if (exportOptions.students) dataToExport.students = appData.students;
    if (exportOptions.areas) dataToExport.areas = appData.areas;
    if (exportOptions.tasks) dataToExport.tasks = appData.tasks;
    if (exportOptions.settings) dataToExport.settings = appData.settings;

    if (Object.keys(dataToExport).length === 0) {
      showToast('⚠️ 請至少勾選一項要備份的資料！', 'warning');
      return;
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `掃地排班系統備份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('✅ 備份下載成功！', 'success');
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setImportedData(data);
        
        // Auto-select available options
        setImportOptions({
          students: !!data.students,
          areas: !!data.areas,
          tasks: !!data.tasks,
          settings: !!data.settings
        });
      } catch (err) {
        showToast('❌ 檔案格式錯誤，無法解析。', 'error');
        setImportedData(null);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const executeImport = () => {
    if (!importedData) return;

    let importedCount = 0;
    
    if (importOptions.students && importedData.students) {
      setAppData.setStudents(importedData.students);
      importedCount++;
    }
    if (importOptions.areas && importedData.areas) {
      setAppData.setAreas(importedData.areas);
      importedCount++;
    }
    if (importOptions.tasks && importedData.tasks) {
      setAppData.setTasks(importedData.tasks);
      importedCount++;
    }
    if (importOptions.settings && importedData.settings) {
      setAppData.setSettings(importedData.settings);
      importedCount++;
    }

    if (importedCount === 0) {
      showToast('⚠️ 請至少勾選一項要還原的資料！', 'warning');
      return;
    }

    showToast('✅ 資料還原成功！', 'success');
    setImportedData(null);
    onClose();
  };

  const closeModal = () => {
    setImportedData(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '90%', maxWidth: '500px', backgroundColor: 'white', 
        padding: '2rem', position: 'relative'
      }}>
        <button 
          onClick={closeModal}
          style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'transparent', border: 'none', fontSize: '1.5rem',
            cursor: 'pointer', color: 'var(--text-muted)'
          }}
        >
          ✖
        </button>

        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', textAlign: 'center' }}>
          💾 備份與還原系統
        </h2>

        {/* Tabs */}
        <div className="segmented-control" style={{ display: 'flex', marginBottom: '1.5rem' }}>
          <button 
            className={`segment-btn ${mode === 'export' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => { setMode('export'); setImportedData(null); }}
          >
            📤 匯出備份
          </button>
          <button 
            className={`segment-btn ${mode === 'import' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setMode('import')}
          >
            📥 匯入還原
          </button>
        </div>

        {mode === 'export' && (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>請勾選您想要打包下載的資料：</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={exportOptions.students} onChange={() => handleExportToggle('students')} />
                🧑‍🎓 學生名單 <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>({appData.students.length} 筆)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={exportOptions.areas} onChange={() => handleExportToggle('areas')} />
                🗺️ 掃區設定 <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>({appData.areas.length} 區)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={exportOptions.tasks} onChange={() => handleExportToggle('tasks')} />
                🧹 工作項目 <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>({appData.tasks.length} 項)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={exportOptions.settings} onChange={() => handleExportToggle('settings')} />
                ⚙️ 報表文字設定
              </label>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleExport}>
              📥 建立並下載備份檔
            </button>
          </div>
        )}

        {mode === 'import' && (
          <div>
            {!importedData ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f9fafb', borderRadius: '8px', border: '2px dashed #d1d5db' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>請選擇先前下載的 .json 備份檔</p>
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  📂 選擇檔案
                  <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} ref={fileInputRef} />
                </label>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '1rem', color: '#047857' }}>
                  ✅ 檔案解析成功！請勾選要還原的資料：
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: importedData.students ? 'pointer' : 'not-allowed', opacity: importedData.students ? 1 : 0.5 }}>
                    <input type="checkbox" disabled={!importedData.students} checked={importOptions.students} onChange={() => handleImportToggle('students')} />
                    🧑‍🎓 學生名單 {importedData.students && <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>({importedData.students.length} 筆)</span>}
                    {!importedData.students && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>無此資料</span>}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: importedData.areas ? 'pointer' : 'not-allowed', opacity: importedData.areas ? 1 : 0.5 }}>
                    <input type="checkbox" disabled={!importedData.areas} checked={importOptions.areas} onChange={() => handleImportToggle('areas')} />
                    🗺️ 掃區設定 {importedData.areas && <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>({importedData.areas.length} 區)</span>}
                    {!importedData.areas && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>無此資料</span>}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: importedData.tasks ? 'pointer' : 'not-allowed', opacity: importedData.tasks ? 1 : 0.5 }}>
                    <input type="checkbox" disabled={!importedData.tasks} checked={importOptions.tasks} onChange={() => handleImportToggle('tasks')} />
                    🧹 工作項目 {importedData.tasks && <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>({importedData.tasks.length} 項)</span>}
                    {!importedData.tasks && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>無此資料</span>}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: importedData.settings ? 'pointer' : 'not-allowed', opacity: importedData.settings ? 1 : 0.5 }}>
                    <input type="checkbox" disabled={!importedData.settings} checked={importOptions.settings} onChange={() => handleImportToggle('settings')} />
                    ⚙️ 報表文字設定
                    {!importedData.settings && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>無此資料</span>}
                  </label>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#d97706', marginBottom: '1rem' }}>
                  ⚠️ 注意：勾選的項目將會完全覆蓋目前的系統資料。
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setImportedData(null)}>
                    重新選擇檔案
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={executeImport}>
                    📤 確定覆蓋並還原
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ExportImportModal;

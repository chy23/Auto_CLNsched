import React, { useEffect, useState } from 'react';
import changelogData from '../changelog.json';

function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '90%', maxWidth: '800px', maxHeight: '90vh',
        backgroundColor: 'white', overflowY: 'auto', position: 'relative',
        padding: '2rem'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'transparent', border: 'none', fontSize: '1.5rem',
            cursor: 'pointer', color: 'var(--text-muted)'
          }}
        >
          ✖
        </button>
        
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
          📜 系統更新紀錄 (Changelog)
        </h2>

        {changelogData && changelogData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {changelogData.map((log, index) => (
              <div key={log.version || index} style={{
                border: '1px solid #e5e7eb', borderRadius: 'var(--radius-sm)',
                padding: '1.5rem', backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ 
                      backgroundColor: 'var(--primary-color)', color: 'white', 
                      padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.85rem' 
                    }}>
                      {log.version}
                    </span>
                    {log.title}
                  </h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    📅 {log.date}
                  </span>
                </div>
                
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <strong>更新細節 / Bug 修正：</strong>
                  <br />
                  {log.details && log.details !== '無詳細說明' ? log.details : '此版本為基礎功能更新或是未詳細標註細節。'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>目前沒有更新紀錄。</p>
        )}
      </div>
    </div>
  );
}

export default ChangelogModal;

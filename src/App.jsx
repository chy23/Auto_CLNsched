import { useState, useEffect } from 'react';
import StudentManager from './components/StudentManager';
import TaskManager from './components/TaskManager';
import AreaManager from './components/AreaManager';
import ScheduleView from './components/ScheduleView';
import ChecklistView from './components/ChecklistView';
import SettingsManager from './components/SettingsManager';
import ChangelogModal from './components/ChangelogModal';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import './App.css';

function App() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [areas, setAreas] = useState(() => {
    const saved = localStorage.getItem('areas');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '教室掃區', chief: '', deputy: '' },
      { id: '2', name: '外掃區', chief: '', deputy: '' }
    ];
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('schedule');
    return saved ? JSON.parse(saved) : null;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('history');
    return saved ? JSON.parse(saved) : null;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      scheduleRules: "時段一：早上打掃時段\n（外掃：請於7:50離開掃區回班級。）\n未完成打掃請在大下課補完成\n時段二：掃地時間\n週一二四五 14:50~15:10 周三 10:10~10:30\n（請詳細完成掃地工作，並於掃地時間結束前3分鐘返回班級）",
      checklistRules: "*✔️完成打掃\n*○打掃時間嬉鬧玩耍\n*❌未打掃\n*△打掃不確實",
      extraNotes: "",
      school: "國小",
      year: "",
      semester: "上學期",
      grade: "",
      classNo: ""
    };
  });

  const [currentTab, setCurrentTab] = useState('setup');
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('areas', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const generateSchedule = () => {
    // Save current schedule to history if exists
    if (schedule) {
      setHistory(schedule);
    }
    
    // Build a map of what task each student did in the previous schedule (or history)
    const prevAssignments = new Map();
    const referenceSchedule = schedule || history;
    if (referenceSchedule && referenceSchedule.assignments) {
      referenceSchedule.assignments.forEach(task => {
        task.assignedStudents.forEach(student => {
          prevAssignments.set(String(student.id), task.name);
        });
      });
    }

    // 1. Identify all chiefs and deputies
    const chiefs = areas.map(a => a.chief).filter(id => id);
    const deputies = areas.map(a => ({ areaName: a.name, studentId: a.deputy })).filter(d => d.studentId);
    
    // Available students exclude chiefs
    let availableStudents = students.filter(s => !chiefs.includes(String(s.id)));

    // Helper to extract student objects for areasInfo
    const getStudentName = (id) => {
      if (!id) return null;
      const s = students.find(st => String(st.id) === String(id));
      return s ? `${s.no}${s.name}` : null;
    };

    const areasInfo = areas.reduce((acc, area) => {
      acc[area.name] = {
        chiefId: area.chief,
        chiefName: getStudentName(area.chief),
        deputyId: area.deputy,
        deputyName: getStudentName(area.deputy)
      };
      return acc;
    }, {});

    // Sort tasks to prioritize those with strict gender requirements first
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.genderReq !== '無' && b.genderReq === '無') return -1;
      if (a.genderReq === '無' && b.genderReq !== '無') return 1;
      return 0;
    });

    // Create a mutable task state
    const taskState = sortedTasks.map(t => ({ ...t, assignedStudents: [], remaining: parseInt(t.count, 10) }));

    // 2. Assign Deputies first
    for (const dep of deputies) {
      const depStudentIndex = availableStudents.findIndex(s => String(s.id) === String(dep.studentId));
      if (depStudentIndex !== -1) {
        const depStudent = availableStudents[depStudentIndex];
        let assigned = false;
        
        // 代理衛生股長(教室掃區)指定工作
        if (dep.areaName.includes('教室')) {
          const preferredTasks = [
            '老師座位整理(每週1、4、5拖地)',
            '共用書櫃＋門把+布告欄 “整理” 及\'擦拭\''
          ];
          for (const pTaskName of preferredTasks) {
            const task = taskState.find(t => t.area === dep.areaName && t.name === pTaskName && t.remaining > 0);
            if (task) {
              if ((task.genderReq === '限男生' && depStudent.gender !== '男') || 
                  (task.genderReq === '限女生' && depStudent.gender !== '女')) {
                // skip due to gender mismatch
              } else {
                task.assignedStudents.push(depStudent);
                availableStudents.splice(depStudentIndex, 1);
                task.remaining--;
                assigned = true;
                break;
              }
            }
          }
        }
        
        // Fallback for other areas or if preferred tasks are unavailable
        if (!assigned) {
          for (const task of taskState) {
            if (task.area === dep.areaName && task.remaining > 0) {
              if ((task.genderReq === '限男生' && depStudent.gender !== '男') || 
                  (task.genderReq === '限女生' && depStudent.gender !== '女')) {
                // skip
              } else {
                task.assignedStudents.push(depStudent);
                availableStudents.splice(depStudentIndex, 1);
                task.remaining--;
                break;
              }
            }
          }
        }
      }
    }

    // 3. Form pools: Early, Late
    const earlyPool = availableStudents.filter(s => !s.arrival || s.arrival === '早到' || s.arrival === '正常').sort(() => Math.random() - 0.5);
    const latePool = availableStudents.filter(s => s.arrival === '晚到').sort(() => Math.random() - 0.5);

    const pools = [earlyPool, latePool];

    for (const pool of pools) {
      let madeAssignment = true;
      // Round-robin loop: assign 1 student per task per pass until pool is empty or no valid assignments can be made
      while (madeAssignment && pool.length > 0) {
        madeAssignment = false;
        
        // Loop over tasks by area alternating to ensure even distribution across areas
        for (const task of taskState) {
          if (task.remaining > 0 && pool.length > 0) {
            // Sort pool so that students who did THIS task last time are at the end
            pool.sort((a, b) => {
              const aDidThisTask = prevAssignments.get(String(a.id)) === task.name ? 1 : 0;
              const bDidThisTask = prevAssignments.get(String(b.id)) === task.name ? 1 : 0;
              return aDidThisTask - bDidThisTask;
            });
            
            const candidateIndex = pool.findIndex(s => {
              if (task.genderReq === '限男生' && s.gender !== '男') return false;
              if (task.genderReq === '限女生' && s.gender !== '女') return false;
              return true;
            });

            if (candidateIndex !== -1) {
              const selected = pool[candidateIndex];
              task.assignedStudents.push(selected);
              pool.splice(candidateIndex, 1);
              task.remaining--;
              madeAssignment = true;
            }
          }
        }
      }
    }

    // Check if all tasks are filled
    const unfilledTasks = taskState.filter(t => t.remaining > 0);
    if (unfilledTasks.length > 0) {
      alert('排班失敗：學生人數不足或無法滿足性別條件。請檢查您的名單與工作設定。');
      setIsGenerating(false);
      return;
    }

    setSchedule({
      date: new Date().toLocaleDateString(),
      assignments: taskState,
      areasInfo: areasInfo
    });
    
    // Fake loading delay for better UX
    setTimeout(() => {
      setIsGenerating(false);
      showToast('✅ 排班完成！', 'success');
      setCurrentTab('schedule');
    }, 600);
  };

  const handleGenerateClick = () => {
    if (schedule) {
      setIsConfirmOpen(true);
    } else {
      executeGenerate();
    }
  };

  const executeGenerate = () => {
    setIsConfirmOpen(false);
    setIsGenerating(true);
    // Use timeout to allow UI to re-render to "isGenerating" state before blocking the main thread
    setTimeout(generateSchedule, 50);
  };

  return (
    <div className="app-container animate-fade-in" style={{ position: 'relative' }}>
      {/* Top right watermark */}
      <div className="no-print" style={{ position: 'absolute', top: '5px', right: '20px', color: 'gray', opacity: 0.25, fontSize: '18pt', pointerEvents: 'none' }}>
        網站建立自楊家驊老師
      </div>

      <header className="no-print" style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
        <button 
          onClick={() => setIsChangelogOpen(true)}
          style={{ 
            position: 'absolute', top: 0, right: 0, 
            background: 'none', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', 
            padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}
          title="系統更新紀錄與版本號"
        >
          📜 更新紀錄
        </button>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>✨ 自動打掃排班系統</h1>
        <p style={{ color: 'var(--text-muted)' }}>輕鬆分配打掃工作，一鍵產生排班表與檢核表</p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <div className="segmented-control">
            <button 
              className={`segment-btn ${currentTab === 'setup' ? 'active' : ''}`}
              onClick={() => setCurrentTab('setup')}
            >
              ⚙️ 設定區
            </button>
            <button 
              className={`segment-btn ${currentTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setCurrentTab('schedule')}
            >
              📅 總排班表
            </button>
            <button 
              className={`segment-btn ${currentTab === 'checklist' ? 'active' : ''}`}
              onClick={() => setCurrentTab('checklist')}
            >
              📋 檢核表列印
            </button>
          </div>
        </div>
      </header>

      <main>
        {currentTab === 'setup' && (
          <>
            <AreaManager areas={areas} setAreas={setAreas} students={students} />
            <div className="grid-2" style={{ marginTop: '2rem' }}>
              <StudentManager students={students} setStudents={setStudents} />
              <TaskManager tasks={tasks} setTasks={setTasks} areas={areas} />
            </div>
            <SettingsManager 
              settings={settings} setSettings={setSettings} 
              students={students} setStudents={setStudents}
              tasks={tasks} setTasks={setTasks}
              areas={areas} setAreas={setAreas}
              showToast={showToast}
            />
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }} className="no-print">
              <button 
                className="btn btn-primary" 
                style={{ 
                  padding: '1rem 3rem', fontSize: '1.2rem',
                  transform: isGenerating ? 'scale(0.98)' : 'scale(1)',
                  opacity: isGenerating ? 0.8 : 1,
                  transition: 'all 0.2s'
                }}
                onClick={handleGenerateClick}
                disabled={isGenerating}
              >
                {isGenerating ? '✨ 魔法排班中...' : '自動產生排班表 🚀'}
              </button>
            </div>
          </>
        )}

        {currentTab === 'schedule' && (
          <ScheduleView schedule={schedule} setSchedule={setSchedule} students={students} settings={settings} />
        )}

        {currentTab === 'checklist' && (
          <ChecklistView schedule={schedule} settings={settings} />
        )}
      </main>

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        title="確認重新產生排班表？"
        message={`這將會覆蓋您目前手動微調的結果。\n\n（系統會自動將目前的排班表記憶為歷史紀錄，並在下次排班時盡量安排學生輪替不同的工作）`}
        onConfirm={executeGenerate}
        onCancel={() => setIsConfirmOpen(false)}
      />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Bottom right watermark */}
      <div className="no-print" style={{ position: 'absolute', bottom: '5px', right: '20px', color: 'gray', opacity: 0.25, fontSize: '18pt', pointerEvents: 'none' }}>
        網站建立自楊家驊老師
      </div>
    </div>
  );
}

export default App;

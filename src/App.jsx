import { useState, useEffect } from 'react';
import StudentManager from './components/StudentManager';
import TaskManager from './components/TaskManager';
import ScheduleView from './components/ScheduleView';
import ChecklistView from './components/ChecklistView';
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

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('schedule');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState('setup'); // setup, schedule, checklist

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [schedule]);

  const generateSchedule = () => {
    // Simple randomized scheduler logic that respects gender and headcount
    let availableStudents = [...students];
    const newSchedule = [];
    
    // Sort tasks to prioritize those with strict gender requirements first
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.genderReq !== '無' && b.genderReq === '無') return -1;
      if (a.genderReq === '無' && b.genderReq !== '無') return 1;
      return 0;
    });

    let success = true;

    for (const task of sortedTasks) {
      const assigned = [];
      const needed = parseInt(task.count, 10);
      
      for (let i = 0; i < needed; i++) {
        // Find valid students
        const validCandidates = availableStudents.filter(s => {
          if (task.genderReq === '限男生' && s.gender !== '男') return false;
          if (task.genderReq === '限女生' && s.gender !== '女') return false;
          return true;
        });

        if (validCandidates.length === 0) {
          success = false;
          break;
        }

        // Pick a random candidate
        const randomIndex = Math.floor(Math.random() * validCandidates.length);
        const selected = validCandidates[randomIndex];

        assigned.push(selected);
        // Remove from available
        availableStudents = availableStudents.filter(s => s.id !== selected.id);
      }
      
      if (!success) break;

      newSchedule.push({
        ...task,
        assignedStudents: assigned
      });
    }

    if (!success) {
      alert('排班失敗：學生人數不足或無法滿足性別條件。請檢查您的名單與工作設定。');
      return;
    }

    setSchedule({
      date: new Date().toLocaleDateString(),
      assignments: newSchedule
    });
    
    setCurrentTab('schedule');
  };

  return (
    <div className="app-container animate-fade-in">
      <header className="no-print" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>✨ 自動打掃排班系統</h1>
        <p style={{ color: 'var(--text-muted)' }}>輕鬆分配打掃工作，一鍵產生排班表與檢核表</p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className={`btn ${currentTab === 'setup' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('setup')}
          >
            設定區 (學生與工作)
          </button>
          <button 
            className={`btn ${currentTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('schedule')}
          >
            總排班表
          </button>
          <button 
            className={`btn ${currentTab === 'checklist' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentTab('checklist')}
          >
            檢核表列印
          </button>
        </div>
      </header>

      <main>
        {currentTab === 'setup' && (
          <>
            <div className="grid-2">
              <StudentManager students={students} setStudents={setStudents} />
              <TaskManager tasks={tasks} setTasks={setTasks} />
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }} className="no-print">
              <button 
                className="btn btn-primary" 
                style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
                onClick={generateSchedule}
              >
                自動產生排班表 🚀
              </button>
            </div>
          </>
        )}

        {currentTab === 'schedule' && (
          <ScheduleView schedule={schedule} />
        )}

        {currentTab === 'checklist' && (
          <ChecklistView schedule={schedule} />
        )}
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import StudentManager from './components/StudentManager';
import TaskManager from './components/TaskManager';
import AreaManager from './components/AreaManager';
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

  const [currentTab, setCurrentTab] = useState('setup');

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
    localStorage.setItem('schedule', JSON.stringify(schedule));
  }, [schedule]);

  const generateSchedule = () => {
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
        chiefName: getStudentName(area.chief),
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
    for (const task of taskState) {
      const areaDeputies = deputies.filter(d => d.areaName === task.area);
      for (const dep of areaDeputies) {
        if (task.remaining > 0) {
          const depStudentIndex = availableStudents.findIndex(s => String(s.id) === String(dep.studentId));
          if (depStudentIndex !== -1) {
            const depStudent = availableStudents[depStudentIndex];
            if ((task.genderReq === '限男生' && depStudent.gender !== '男') || 
                (task.genderReq === '限女生' && depStudent.gender !== '女')) {
              // skip
            } else {
              task.assignedStudents.push(depStudent);
              availableStudents.splice(depStudentIndex, 1);
              task.remaining--;
            }
          }
        }
      }
    }

    // 3. Form pools: Early, Normal, Late
    const earlyPool = availableStudents.filter(s => s.arrival === '早到').sort(() => Math.random() - 0.5);
    const normalPool = availableStudents.filter(s => !s.arrival || s.arrival === '正常').sort(() => Math.random() - 0.5);
    const latePool = availableStudents.filter(s => s.arrival === '晚到').sort(() => Math.random() - 0.5);

    const pools = [earlyPool, normalPool, latePool];

    for (const pool of pools) {
      let madeAssignment = true;
      // Round-robin loop: assign 1 student per task per pass until pool is empty or no valid assignments can be made
      while (madeAssignment && pool.length > 0) {
        madeAssignment = false;
        
        // Loop over tasks by area alternating to ensure even distribution across areas?
        // Since taskState is likely grouped by area implicitly, looping it distributes 1 per task. 
        // This distributes them evenly across all tasks!
        for (const task of taskState) {
          if (task.remaining > 0 && pool.length > 0) {
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
      return;
    }

    setSchedule({
      date: new Date().toLocaleDateString(),
      assignments: taskState,
      areasInfo: areasInfo
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
            <AreaManager areas={areas} setAreas={setAreas} students={students} />
            <div className="grid-2" style={{ marginTop: '2rem' }}>
              <StudentManager students={students} setStudents={setStudents} />
              <TaskManager tasks={tasks} setTasks={setTasks} areas={areas} />
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

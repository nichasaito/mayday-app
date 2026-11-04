import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  Home, 
  ListTodo, 
  Plus,
  Clock,
  BookOpen,
  CalendarDays,
  Coffee,
  X,
  Trash2,
  Bell,
  Tag,
  Sun,
  Moon,
  Pin
} from 'lucide-react';

// --- สไตล์ฟอนต์ Mali และ Custom Styling ---
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Mali:wght@400;500;600;700&display=swap');
  
  body {
    font-family: 'Mali', cursive;
    transition: background-color 0.4s ease, color 0.4s ease;
  }
  
  .glass-card-light {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 8px 32px 0 rgba(236, 179, 199, 0.18);
  }

  .glass-card-dark {
    background: rgba(30, 41, 59, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// --- ข้อมูลตั้งต้นเผื่อผู้ใช้เพิ่งเปิดใช้งานครั้งแรก ---
const defaultTags = [
  { id: 'cmu', label: 'เรียน / มหาลัย 📚', colorClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700' },
  { id: 'cafe', label: 'งานกะคาเฟ่ ☕', colorClass: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' },
  { id: 'fit', label: 'ออกกำลังกาย 🏃‍♀️', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700' },
];

const defaultTasks = [
  {
    id: 1,
    title: 'ส่งงานโปรเจกต์ MGMT',
    type: 'assignment',
    tagId: 'cmu',
    description: 'ส่งในระบบ e-learning พร้อมไฟล์ Presentation',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    completed: false,
    isPinned: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'เข้ากะที่คาเฟ่',
    type: 'event',
    tagId: 'cafe',
    description: 'กะบ่าย 13:00 - 18:00',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    completed: false,
    isPinned: true,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  // --- States พร้อมอ่านข้อมูลจาก LocalStorage ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('myday_darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  const [currentTab, setCurrentTab] = useState('tasks'); // tasks, calendar

  const [selectedDate, setSelectedDate] = useState(new Date()); // ยก State มาไว้ระดับบน ป้องกันปฏิทินเด้งกลับ
  const [calendarMonth, setCalendarMonth] = useState(new Date()); // State สำหรับการเลื่อนดูเดือนในปฏิทิน

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('myday_tasks');
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('myday_tags');
    return saved ? JSON.parse(saved) : defaultTags;
  });

  const [mood, setMood] = useState(() => {
    return localStorage.getItem('myday_mood') || '😊';
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('myday_profile');
    return saved ? JSON.parse(saved) : {
      name: 'ณิชา',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Nicha&backgroundColor=ffdfbf'
    };
  });

  const [now, setNow] = useState(new Date());
  const [notifications, setNotifications] = useState([]);

  // Filter States
  const [taskFilter, setTaskFilter] = useState('all'); // all, todo, assignment, event, completed

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Form States
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'todo',
    tagId: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    time: '12:00',
    isPinned: false
  });

  // Custom Tag State
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState('#ff6b6b');

  // --- Sync การเปลี่ยนแปลงลง LocalStorage อัตโนมัติ ---
  useEffect(() => {
    localStorage.setItem('myday_darkmode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('myday_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('myday_tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('myday_mood', mood);
  }, [mood]);

  useEffect(() => {
    localStorage.setItem('myday_profile', JSON.stringify(profile));
  }, [profile]);

  // Real-time Timer update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Notifications Helper
  const showNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // --- Task Operations ---
  const handleToggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!task.completed) {
      showNotification(`ทำ "${task.title}" เสร็จแล้ว! 🎉 เก่งมากค่ะ`);
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleTogglePin = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const updatedPin = !t.isPinned;
        showNotification(updatedPin ? 'ปักหมุดแสดงนับถอยหลังแล้ว 📌' : 'ยกเลิกการปักหมุดแล้ว');
        return { ...t, isPinned: updatedPin };
      }
      return t;
    }));
  };

  const handleAddNewTag = () => {
    if (!newTagLabel.trim()) return;
    const newTag = {
      id: 'tag_' + Date.now(),
      label: newTagLabel,
      hexColor: newTagColor
    };
    setTags([...tags, newTag]);
    setNewTask({ ...newTask, tagId: newTag.id });
    setNewTagLabel('');
    setIsAddingTag(false);
    showNotification('เพิ่มป้ายกำกับใหม่สำเร็จ! ✨');
  };

  const handleDeleteTag = (tagId, e) => {
    e.stopPropagation();
    setTags(tags.filter(t => t.id !== tagId));
    if (newTask.tagId === tagId) {
      setNewTask(prev => ({ ...prev, tagId: '' }));
    }
    showNotification('ลบป้ายกำกับเรียบร้อยแล้ว');
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const combinedDateTime = `${newTask.date}T${newTask.time}:00`;
    
    const taskToAdd = {
      id: Date.now(),
      title: newTask.title,
      type: newTask.type,
      tagId: newTask.tagId,
      description: newTask.description,
      dueDate: new Date(combinedDateTime).toISOString(),
      completed: false,
      isPinned: newTask.isPinned,
      createdAt: new Date().toISOString()
    };

    setTasks([taskToAdd, ...tasks]);
    showNotification(`เพิ่มงาน "${taskToAdd.title}" เรียบร้อย! 📝`);
    setIsModalOpen(false);
    setNewTask({ 
      title: '', 
      type: 'todo', 
      tagId: '', 
      description: '', 
      date: new Date().toISOString().slice(0, 10), 
      time: '12:00',
      isPinned: false 
    });
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    showNotification('ลบรายการงานเรียบร้อยแล้ว');
  };

  // --- Calculations ---
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalActive = activeTasks.length;
  const totalCompleted = completedTasks.length;
  const progressPercent = (totalActive + totalCompleted) === 0 ? 0 : Math.round((totalCompleted / (totalActive + totalCompleted)) * 100);

  // ดึงรายการนับถอยหลัง (งานที่ปักหมุด หรือ งานส่ง/กิจกรรม ที่ยังไม่เลยกำหนด)
  const getCountdownTasks = () => {
    const pinned = activeTasks.filter(t => t.isPinned && new Date(t.dueDate) > now);
    if (pinned.length > 0) {
      return pinned.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    return activeTasks
      .filter(t => (t.type === 'event' || t.type === 'assignment') && new Date(t.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const formatCountdownNoSeconds = (targetDate) => {
    const diff = new Date(targetDate) - now;
    if (diff <= 0) return 'ถึงเวลาแล้ว!';
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);

    if (d > 0) return `${d} วัน ${h} ชม. ${m} นาที`;
    if (h > 0) return `${h} ชม. ${m} นาที`;
    return `${m} นาที`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'assignment': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700';
      case 'event': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700';
      default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'assignment': return <BookOpen size={14} />;
      case 'event': return <CalendarDays size={14} />;
      default: return <ListTodo size={14} />;
    }
  };

  const glassCardClass = isDarkMode ? 'glass-card-dark text-slate-100' : 'glass-card-light text-slate-800';

  // --- Task Card Component ---
  const TaskCard = ({ task }) => {
    const taskTag = tags.find(t => t.id === task.tagId);
    
    return (
      <div className={`${glassCardClass} p-4 rounded-2xl flex gap-3 items-start transition-all hover:shadow-md ${task.completed ? 'opacity-60' : ''}`}>
        <button 
          onClick={() => handleToggleComplete(task.id)}
          className={`mt-1 flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-400' : isDarkMode ? 'text-slate-500 hover:text-rose-400' : 'text-gray-300 hover:text-rose-400'}`}
        >
          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${getTypeColor(task.type)}`}>
              {getTypeIcon(task.type)}
              {task.type === 'assignment' ? 'งานส่ง' : task.type === 'event' ? 'กิจกรรม' : 'ทั่วไป'}
            </span>
            
            {taskTag && (
              <span 
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${taskTag.colorClass || ''}`}
                style={taskTag.hexColor ? { 
                  backgroundColor: `${taskTag.hexColor}25`, 
                  color: taskTag.hexColor, 
                  borderColor: `${taskTag.hexColor}60` 
                } : {}}
              >
                <Tag size={10} />
                {taskTag.label}
              </span>
            )}

            <span className={`text-[11px] flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              <Clock size={11} />
              {new Date(task.dueDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h4 className={`font-bold text-base truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h4>

          {task.description && (
            <p className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!task.completed && (
            <button
              onClick={() => handleTogglePin(task.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                task.isPinned ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50' : 'text-gray-300 hover:text-rose-400'
              }`}
              title={task.isPinned ? 'ถอนหมุดนับถอยหลัง' : 'ปักหมุดนับถอยหลัง'}
            >
              <Pin size={16} className={task.isPinned ? 'fill-rose-400' : ''} />
            </button>
          )}

          {task.completed && (
            <button 
              onClick={() => handleDeleteTask(task.id)} 
              className="text-gray-300 hover:text-rose-500 p-1.5 transition-colors"
              title="ลบงานนี้ถาวร"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  // --- Main Layout Render ---
  const countdownList = getCountdownTasks();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
      
      <div className={`min-h-screen max-w-md mx-auto relative overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#fff0f5] text-slate-800'
      } shadow-2xl`}>
        
        {/* Background Ambient Glows */}
        <div className={`fixed top-[-10%] left-[-10%] w-64 h-64 rounded-full filter blur-3xl opacity-40 pointer-events-none ${
          isDarkMode ? 'bg-indigo-900' : 'bg-pink-200'
        }`}></div>
        <div className={`fixed bottom-[-10%] right-[-10%] w-64 h-64 rounded-full filter blur-3xl opacity-40 pointer-events-none ${
          isDarkMode ? 'bg-rose-950' : 'bg-emerald-100'
        }`}></div>

        <div className="relative z-10 h-screen flex flex-col">
          
          {/* Persistent Header */}
          <header className="px-5 pt-6 pb-3 border-b border-rose-100/30 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-full overflow-hidden border-2 border-rose-300 shadow-md cursor-pointer transition-transform hover:scale-105 flex-shrink-0"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-base font-extrabold text-rose-400 dark:text-rose-300 transition-colors cursor-pointer hover:text-rose-500 flex items-center gap-1"
                  >
                    {profile.name} {mood}
                  </h1>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    เสร็จแล้ว {totalCompleted}/{totalActive + totalCompleted} รายการ ({progressPercent}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mood Selector Badges */}
                <div className={`flex gap-0.5 p-1 rounded-2xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/70 border-white'}`}>
                  {['😊', '🥳', '😴', '🫠'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { setMood(emoji); showNotification(`บันทึกอารมณ์แล้ว ${emoji}`); }}
                      className={`text-xs px-1 py-0.5 rounded-xl transition-all ${
                        mood === emoji 
                          ? 'bg-rose-200 dark:bg-rose-900/60 scale-110 shadow-inner' 
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-xl border transition-all shadow-sm ${
                    isDarkMode 
                      ? 'bg-slate-800 text-amber-300 border-slate-700' 
                      : 'bg-white text-slate-700 border-pink-100'
                  }`}
                  title={isDarkMode ? 'สลับเป็นโหมดกลางวัน' : 'สลับเป็นโหมดกลางคืน'}
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 pt-4 pb-28 hide-scrollbar">
            {currentTab === 'tasks' && (
              <div className="space-y-4 animate-fade-in pb-24">
                
                {/* Countdown Cards at the top of Tasks view */}
                {countdownList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                      <Clock size={14} className="text-orange-400" /> งานปักหมุดนับถอยหลัง
                    </h3>
                    <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x pb-1">
                      {countdownList.map(event => (
                        <div 
                          key={event.id} 
                          className={`${glassCardClass} rounded-2xl p-3.5 min-w-[220px] snap-center border-l-4 flex-shrink-0 ${
                            event.type === 'assignment' ? 'border-l-purple-400' : 'border-l-orange-400'
                          }`}
                        >
                          <p className="text-[10px] font-semibold text-gray-400 mb-0.5 flex items-center gap-1">
                            <Pin size={10} className="text-rose-400 fill-rose-400" />
                            {getTypeIcon(event.type)} {event.type === 'assignment' ? 'งานส่ง' : 'กิจกรรม'}
                          </p>
                          <p className="text-xs font-bold truncate mb-1.5" title={event.title}>{event.title}</p>
                          <div className={`text-[11px] font-bold inline-block px-2.5 py-0.5 rounded-lg ${
                            event.type === 'assignment' 
                              ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300' 
                              : 'text-orange-600 bg-orange-50 dark:bg-orange-950/60 dark:text-orange-300'
                          }`}>
                            ⏳ {formatCountdownNoSeconds(event.dueDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">รายการงาน 📋</h2>
                    <span className="bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {tasks.filter(t => taskFilter === 'completed' ? t.completed : (!t.completed && (taskFilter === 'all' || t.type === taskFilter))).length} รายการ
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                  >
                    <Plus size={18} strokeWidth={3} />
                    เพิ่มงานใหม่
                  </button>
                </div>
                
                {/* Sub-tabs */}
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 snap-x">
                  {[
                    { id: 'all', label: 'ทั้งหมด' },
                    { id: 'todo', label: 'ทั่วไป' },
                    { id: 'assignment', label: 'งานส่ง' },
                    { id: 'event', label: 'กิจกรรม' },
                    { id: 'completed', label: 'เสร็จแล้ว 🏆' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setTaskFilter(f.id)}
                      className={`snap-start whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        taskFilter === f.id 
                          ? f.id === 'completed' ? 'bg-emerald-500 text-white shadow-md' : 'bg-rose-400 text-white shadow-md' 
                          : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white/70 text-gray-500 hover:bg-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5 mt-2">
                  {(() => {
                    const filtered = tasks.filter(t => {
                      if (taskFilter === 'completed') return t.completed;
                      if (t.completed) return false;
                      if (taskFilter === 'all') return true;
                      return t.type === taskFilter;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className={`${glassCardClass} text-center py-10 rounded-3xl mt-2`}>
                          <div className="text-2xl mb-1">✨</div>
                          <p className="text-xs text-gray-400">
                            {taskFilter === 'completed' ? 'ยังไม่มีประวัติงานที่ทำเสร็จ' : 'ไม่มีงานในหมวดหมู่นี้!'}
                          </p>
                        </div>
                      );
                    }

                    return filtered
                      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                      .map(task => <TaskCard key={task.id} task={task} />);
                  })()}
                </div>
              </div>
            )}

            {currentTab === 'calendar' && (
              <div className="animate-fade-in pb-24">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">ปฏิทิน 📅</h2>
                  <button 
                    onClick={() => { setSelectedDate(new Date()); setCalendarMonth(new Date()); }}
                    className="text-xs text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800"
                  >
                    วันนี้
                  </button>
                </div>

                <div className={`${glassCardClass} p-4 rounded-3xl mb-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <button 
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-rose-400 font-bold"
                    >
                      ◀
                    </button>
                    <div className="font-bold text-sm text-rose-400">
                      {calendarMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </div>
                    <button 
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-rose-400 font-bold"
                    >
                      ▶
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-gray-400">
                    {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const year = calendarMonth.getFullYear();
                      const month = calendarMonth.getMonth();
                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                      const firstDay = new Date(year, month, 1).getDay();
                      
                      const daysGrid = [];
                      for (let i = 0; i < firstDay; i++) daysGrid.push(null);
                      for (let i = 1; i <= daysInMonth; i++) daysGrid.push(new Date(year, month, i));

                      const todayStr = new Date().toDateString();
                      const selectedStr = selectedDate ? selectedDate.toDateString() : '';

                      return daysGrid.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className="p-2" />;
                        
                        const dateStr = date.toDateString();
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === selectedStr;
                        const dayTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === dateStr);
                        
                        return (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedDate(date)}
                            className={`min-h-[3.2rem] p-1 rounded-xl border flex flex-col items-center justify-start cursor-pointer transition-all ${
                              isToday 
                                ? 'bg-rose-100/70 border-rose-300 dark:bg-rose-950/60 dark:border-rose-700' 
                                : isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/60' : 'bg-white/50 border-transparent hover:bg-white'
                            } ${isSelected ? 'ring-2 ring-rose-400 shadow-sm scale-105 z-10' : ''}`}
                          >
                            <span className={`text-xs ${isToday ? 'font-extrabold text-rose-500' : ''}`}>
                              {date.getDate()}
                            </span>
                            <div className="w-full mt-1 flex flex-col gap-0.5 px-0.5">
                              {dayTasks.map(t => (
                                <div 
                                  key={t.id} 
                                  className={`h-1 w-full rounded-full ${
                                    t.completed ? 'bg-gray-300' : 
                                    t.type === 'assignment' ? 'bg-purple-400' : 
                                    t.type === 'event' ? 'bg-orange-400' : 'bg-blue-400'
                                  }`} 
                                ></div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-3 text-[10px] justify-center text-gray-400">
                    <div className="flex items-center gap-1"><div className="w-2.5 h-1 rounded-full bg-blue-400"></div> ทั่วไป</div>
                    <div className="flex items-center gap-1"><div className="w-2.5 h-1 rounded-full bg-purple-400"></div> งานส่ง</div>
                    <div className="flex items-center gap-1"><div className="w-2.5 h-1 rounded-full bg-orange-400"></div> กิจกรรม</div>
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                      <CalendarDays className="text-rose-400" size={14} />
                      รายการวันที่ {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="space-y-2.5">
                      {(() => {
                        const tasksForSelected = tasks.filter(t => new Date(t.dueDate).toDateString() === selectedDate.toDateString());
                        if (tasksForSelected.length === 0) {
                          return (
                            <div className={`${glassCardClass} text-center py-6 rounded-2xl text-xs text-gray-400`}>
                              ไม่มีรายการในวันนี้ 🏖️
                            </div>
                          );
                        }
                        return tasksForSelected
                          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                          .map(task => <TaskCard key={task.id} task={task} />);
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Floating Action Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-rose-400 text-white rounded-full shadow-[0_8px_16px_rgba(251,113,133,0.4)] hover:bg-rose-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-30"
            title="เพิ่มงานใหม่"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>

          {/* Bottom Nav Bar (2 Tabs Only) */}
          <nav className={`fixed bottom-0 max-w-md w-full ${glassCardClass} border-t rounded-t-3xl shadow-xl z-30`}>
            <div className="flex justify-around items-center h-20 px-8">
              {[
                { id: 'tasks', icon: ListTodo, label: 'งาน (Tasks)' },
                { id: 'calendar', icon: CalendarIcon, label: 'ปฏิทิน (Calendar)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex flex-col items-center justify-center w-28 transition-all ${
                    currentTab === tab.id 
                      ? 'text-rose-400 font-bold scale-110' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon size={22} className="mb-1" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Modal: Add Task */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
            <div className={`${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'} w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto hide-scrollbar`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">เพิ่มรายการใหม่ ✨</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">ชื่องาน / กิจกรรม</label>
                  <input 
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="เช่น ส่งรายงานวิจัย, ไปคาเฟ่..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-rose-300 ${
                      isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-gray-100'
                    }`}
                  />
                </div>

                {/* Pin Toggle Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-pink-50/70 dark:bg-slate-800 border border-pink-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Pin size={16} className={newTask.isPinned ? "text-rose-500 fill-rose-400" : "text-gray-400"} />
                    <span className="font-semibold text-xs">ปักหมุดนับถอยหลังในหน้าหลัก</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewTask(prev => ({ ...prev, isPinned: !prev.isPinned }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${newTask.isPinned ? 'bg-rose-400' : 'bg-gray-300 dark:bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${newTask.isPinned ? 'transform translate-x-5' : ''}`}></div>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'todo', label: 'งานทั่วไป' },
                    { id: 'assignment', label: 'งานส่ง' },
                    { id: 'event', label: 'กิจกรรม' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewTask({...newTask, type: t.id})}
                      className={`py-2 rounded-xl font-bold transition-all ${
                        newTask.type === t.id 
                          ? 'bg-rose-400 text-white shadow-sm' 
                          : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block font-semibold mb-1">ป้ายกำกับ (Tag)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setNewTask({...newTask, tagId: tag.id})}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all ${
                          newTask.tagId === tag.id ? 'ring-2 ring-rose-400 font-bold scale-105' : 'opacity-80'
                        } ${tag.colorClass || ''}`}
                        style={tag.hexColor ? { 
                          backgroundColor: `${tag.hexColor}25`, 
                          color: tag.hexColor, 
                          borderColor: `${tag.hexColor}60` 
                        } : {}}
                      >
                        <Tag size={10} />
                        {tag.label}
                        <span
                          onClick={(e) => handleDeleteTag(tag.id, e)}
                          className="ml-1 text-gray-400 hover:text-rose-500 font-bold p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                          title="ลบแท็กนี้"
                        >
                          ✕
                        </span>
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(!isAddingTag)}
                      className="px-2.5 py-1 rounded-full border border-dashed border-rose-400 text-rose-500 bg-rose-50 dark:bg-rose-950/40"
                    >
                      + เพิ่มแท็ก
                    </button>
                  </div>

                  {isAddingTag && (
                    <div className="flex gap-2 p-2 bg-rose-50 dark:bg-slate-800 rounded-xl">
                      <input 
                        type="color" 
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        placeholder="ชื่อแท็กใหม่..."
                        value={newTagLabel}
                        onChange={(e) => setNewTagLabel(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg border-none outline-none dark:bg-slate-700"
                      />
                      <button 
                        type="button"
                        onClick={handleAddNewTag}
                        className="bg-rose-400 text-white px-3 py-1 rounded-lg font-bold"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">วันที่</label>
                    <input 
                      type="date"
                      required
                      value={newTask.date}
                      onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                      className={`w-full px-3 py-2 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">เวลา</label>
                    <input 
                      type="time"
                      required
                      value={newTask.time}
                      onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                      className={`w-full px-3 py-2 rounded-xl outline-none ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">รายละเอียดเพิ่มเติม</label>
                  <textarea 
                    rows="2"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="ใส่โน้ตเพิ่มเติม..."
                    className={`w-full px-3 py-2 rounded-xl outline-none resize-none ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-3 rounded-2xl shadow-md transition-all active:scale-98"
                >
                  บันทึกงาน
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Profile */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'} w-full max-w-sm rounded-3xl p-6 shadow-2xl`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">ตั้งค่าโปรไฟล์ 👤</h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-rose-300 shadow-md">
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="text-xs text-rose-400 font-bold cursor-pointer hover:underline">
                  เปลี่ยนรูปภาพโปรไฟล์
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setProfile({ ...profile, avatar: reader.result });
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </label>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">ชื่อของคุณ</label>
                  <input 
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className={`w-full px-3 py-2 rounded-xl text-center font-bold text-base outline-none ${
                      isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
                    }`}
                  />
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl shadow-md"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {notifications.map(note => (
            <div 
              key={note.id} 
              className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 animate-slide-up pointer-events-auto text-xs font-bold ${
                isDarkMode 
                  ? 'bg-slate-800/90 text-slate-100 border-slate-700' 
                  : 'bg-white/95 text-slate-800 border-pink-100'
              }`}
            >
              <Bell size={16} className="text-rose-400" />
              <span>{note.message}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}

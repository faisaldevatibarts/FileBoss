'use client';

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'daybook.tasks.v1';
const THEME_STORAGE_KEY = 'daybook.theme.v1';
const views = [
  { id: 'all', label: 'All tasks', icon: 'grid' },
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'upcoming', label: 'Upcoming', icon: 'calendar' },
  { id: 'completed', label: 'Completed', icon: 'check' },
];
const categories = ['Personal', 'Work', 'Learning'];

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    check: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    plus: <path d="M12 5v14m-7-7h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    trash: <><path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDueDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
//my app/page.js
export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState('light');
  const [themeReady, setThemeReady] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [today, setToday] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Personal');
  const [showDetails, setShowDetails] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setToday(dateKey(now));
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    if (window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark') setTheme('dark');
    setThemeReady(true);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  useEffect(() => {
    if (themeReady) window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, themeReady]);

  useEffect(() => {
    function handleShortcut(event) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const todayCount = tasks.filter((task) => !task.completed && task.dueDate === today).length;
  const visibleTasks = tasks.filter((task) => {
    if (activeView === 'today' && (task.completed || task.dueDate !== today)) return false;
    if (activeView === 'upcoming' && (task.completed || !task.dueDate || task.dueDate <= today)) return false;
    if (activeView === 'completed' && !task.completed) return false;
    if (activeView === 'all' && task.completed) return false;
    if (activeCategory !== 'All' && task.category !== activeCategory) return false;
    return task.title.toLowerCase().includes(query.trim().toLowerCase());
  }).sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    if (!a.completed && a.dueDate !== b.dueDate) return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || b.createdAt - a.createdAt;
  });

  function addTask(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      inputRef.current?.focus();
      return;
    }
    setTasks((current) => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: cleanTitle,
      dueDate,
      priority,
      category,
      completed: false,
      createdAt: Date.now(),
    }, ...current]);
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setShowDetails(false);
    inputRef.current?.focus();
  }

  function toggleTask(id) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.completed));
  }

  const activeLabel = views.find((view) => view.id === activeView)?.label || 'All tasks';

  return (
    <main className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="ibtodo home">
          <span className="brand-mark"><span /></span>
          <span>ibtodo<span className="brand-period">.</span></span>
        </a>
        <button className="new-task-button" onClick={() => inputRef.current?.focus()}>
          <Icon name="plus" size={17} /> <span>New task</span><kbd>N</kbd>
        </button>

        <div className="sidebar-label">Workspace</div>
        <nav className="view-nav" aria-label="Task views">
          {views.map((view) => {
            const count = view.id === 'all' ? activeCount : view.id === 'today' ? todayCount : view.id === 'completed' ? completedCount : null;
            return <button key={view.id} className={`nav-item ${activeView === view.id ? 'is-active' : ''}`} onClick={() => setActiveView(view.id)}>
              <Icon name={view.icon} size={17} /><span>{view.label}</span>{count > 0 && <span className="nav-count">{count}</span>}
            </button>;
          })}
        </nav>

        <div className="sidebar-label category-label">Categories <button aria-label="Show all categories" onClick={() => setActiveCategory('All')}><Icon name="plus" size={15} /></button></div>
        <nav className="category-nav" aria-label="Categories">
          <button className={`category-item ${activeCategory === 'All' ? 'is-selected' : ''}`} onClick={() => setActiveCategory('All')}><span className="category-dot all-dot" />All categories<span>{activeCount}</span></button>
          {categories.map((item) => <button key={item} className={`category-item ${activeCategory === item ? 'is-selected' : ''}`} onClick={() => setActiveCategory(activeCategory === item ? 'All' : item)}><span className={`category-dot ${item.toLowerCase()}`} />{item}<span>{tasks.filter((task) => task.category === item && !task.completed).length || ''}</span></button>)}
        </nav>

        <div className="sidebar-bottom">
          <div className="progress-copy"><span>Your week</span><span>{Math.min(100, Math.round((completedCount / Math.max(1, tasks.length)) * 100))}%</span></div>
          <div className="progress-track"><span style={{ width: `${Math.min(100, Math.round((completedCount / Math.max(1, tasks.length)) * 100))}%` }} /></div>
          <p>Small steps add up.</p>
        </div>
      </aside>

      <section className="main-panel" id="home">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeLabel}</strong></div>
          <label className="search-box"><Icon name="search" size={17} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks..." aria-label="Search tasks" /><kbd>/</kbd></label>
          <button className="theme-toggle" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={theme === 'dark'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} /></button>
          <button className="avatar" title="Your workspace">F</button>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">A LITTLE PROGRESS, EVERY DAY</div>
              <h1>{activeLabel}<span className="heading-count">{visibleTasks.length}</span></h1>
              <p>{activeView === 'today' ? 'Make room for what matters today.' : activeView === 'completed' ? 'Look how far you have come.' : 'Keep your focus on what matters.'}</p>
            </div>
              <div className="date-stamp"><span className="date-day">{currentDate?.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span><strong>{currentDate?.getDate()}</strong><span>{currentDate?.toLocaleDateString('en-US', { month: 'short' })}</span></div>
          </div>

          <form className="task-composer" onSubmit={addTask}>
            <div className="composer-main"><span className="composer-plus"><Icon name="plus" size={18} /></span><input ref={inputRef} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs your attention?" aria-label="New task title" /><button className="add-button" type="submit">Add task <span>↵</span></button></div>
            {showDetails && <div className="composer-options">
              <label className="option-control"><Icon name="calendar" size={15} /><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Due date" /></label>
              <label className="option-control"><span className={`priority-mark ${priority}`} /> <select value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Priority"><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select></label>
              <label className="option-control"><span className={`category-dot ${category.toLowerCase()}`} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Category">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>}
            <div className="composer-footer"><button type="button" className={`details-toggle ${showDetails ? 'details-open' : ''}`} onClick={() => setShowDetails(!showDetails)}><Icon name="dots" size={17} /> {showDetails ? 'Hide details' : 'Add details'}</button><span>Press <kbd>Enter</kbd> to create</span></div>
          </form>

          <div className="list-toolbar"><div className="toolbar-label"><span className="live-dot" />{activeView === 'completed' ? 'FINISHED' : 'YOUR LIST'} <span className="toolbar-count">{visibleTasks.length}</span></div><div className="toolbar-actions"><select aria-label="Filter by category" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}><option value="All">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>{completedCount > 0 && <button className="clear-button" onClick={clearCompleted}><Icon name="trash" size={14} /> Clear done</button>}</div></div>

          <div className="task-list">
            {visibleTasks.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name={query ? 'search' : 'check'} size={22} /></span><h2>{query ? 'No matching tasks' : activeView === 'completed' ? 'Nothing completed yet' : 'A clear page'}</h2><p>{query ? 'Try another search or clear your filters.' : 'Add a task above and give your day a little direction.'}</p></div> : visibleTasks.map((task) => <article className={`task-row ${task.completed ? 'is-completed' : ''}`} key={task.id}>
              <button className="task-check" onClick={() => toggleTask(task.id)} aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`} aria-pressed={task.completed}>{task.completed && <Icon name="check" size={13} />}</button>
              <div className="task-copy"><span className="task-title">{task.title}</span><div className="task-meta">{task.dueDate && <span className={`due-date ${!task.completed && task.dueDate < today ? 'overdue' : ''}`}><Icon name="calendar" size={13} />{task.dueDate < today && !task.completed ? 'Overdue · ' : ''}{formatDueDate(task.dueDate)}</span>}<span className="task-category"><span className={`category-dot ${task.category.toLowerCase()}`} />{task.category}</span></div></div>
              <span className={`priority-pill ${task.priority}`}><span />{task.priority}</span><button className="delete-task" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`} title="Delete task"><Icon name="trash" size={16} /></button>
            </article>)}
          </div>
          {visibleTasks.length > 0 && <div className="list-footnote"><Icon name="arrow" size={14} /> You’ve got this. One thing at a time.</div>}
        </div>
        <footer className="bottom-bar"><span>IBTODO <span className="brand-period">/</span> YOUR SPACE, YOUR PACE</span><span>{ready ? 'SAVED ON THIS DEVICE' : 'LOADING YOUR TASKS'} <span className="save-indicator" /></span></footer>
      </section>
    </main>
  );
}

import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';

// --- Utilities for Local Storage & IDs ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('Error setting localStorage', error);
    }
  };
  return [storedValue, setValue];
};

// --- Mock Data (Database Seed) ---
const SEED_DATA = {
  users: [
    { id: 'u1', name: 'Harsh Shukla', role: 'Admin', email: 'harsh@gmail.com', phone: '+91-9876543210', password: 'password123', avatar: 'https://placehold.co/100x100/4F46E5/FFFFFF?text=HS' },
    { id: 'u2', name: 'Ayush Bhatt', role: 'Caregiver', email: 'ayush@gmail.com', phone: '+91-8765432100', password: 'password123', avatar: 'https://placehold.co/100x100/10B981/FFFFFF?text=AB' }
  ],
  patient: {
    id: 'p1', name: 'Ramesh Shukla', relation: 'Father', age: 68, gender: 'Male', bloodGroup: 'B+', phone: '+91-9876543220', dob: '15 Mar 1958', address: '123, Shastri Nagar, Ghaziabad, UP', primaryDoctor: 'Dr. Rahul Verma (Cardiologist)', allergies: 'Penicillin', conditions: ['Hypertension', 'Type 2 Diabetes', 'Asthma']
  },
  members: [
    { id: 'm1', name: 'Harsh Shukla', role: 'Admin', phone: '+91-9876543210', email: 'harsh@gmail.com', status: 'Active', initials: 'HS', color: 'bg-blue-500', permissions: 'Full Access' },
    { id: 'm2', name: 'Ayush Bhatt', role: 'Caregiver', phone: '+91-8765432100', email: 'ayush@gmail.com', status: 'Active', initials: 'AB', color: 'bg-green-500', permissions: 'Manage Care' },
    { id: 'm3', name: 'Broja Kishor', role: 'Caregiver', phone: '+91-9988776655', email: 'broja@gmail.com', status: 'Active', initials: 'BK', color: 'bg-purple-500', permissions: 'View & Update' },
    { id: 'm4', name: 'Neha Singh', role: 'Doctor', phone: '+91-9008765432', email: 'neha.doc@gmail.com', status: 'Active', initials: 'NS', color: 'bg-teal-500', permissions: 'View Only' }
  ],
  medications: [
    { id: 'med1', name: 'Paracetamol 650mg', member: 'Ramesh Shukla', frequency: 'Twice a day', timing: 'After Meals', time: '09:00 AM, 09:00 PM', startDate: '2026-01-10', status: 'Active', type: 'Pain Relief' },
    { id: 'med2', name: 'Vitamin D3', member: 'Ramesh Shukla', frequency: 'Once a day', timing: 'After Lunch', time: '01:00 PM', startDate: '2026-02-15', status: 'Active', type: 'Supplement' },
    { id: 'med3', name: 'Metformin 500mg', member: 'Ramesh Shukla', frequency: 'Twice a day', timing: 'Before Meals', time: '08:00 AM, 08:00 PM', startDate: '2026-02-22', status: 'Active', type: 'Diabetes' }
  ],
  reminders: [
    { id: 'r1', title: 'Refill Amlodipine 5mg', type: 'Medication', status: 'Completed', time: '09:00 AM', date: new Date().toISOString().split('T')[0], member: 'Ramesh Shukla' },
    { id: 'r2', title: 'Doctor Appointment with Dr. Verma', type: 'Appointment', status: 'Pending', time: '11:00 AM', date: new Date().toISOString().split('T')[0], member: 'Ramesh Shukla' },
    { id: 'r3', title: 'Paracetamol 650mg', type: 'Medication', status: 'Overdue', time: '08:00 AM', date: '2026-05-27', member: 'Ramesh Shukla' }
  ],
  tasks: [
    { id: 't1', title: 'Help with Morning Routine', category: 'Health', assignee: 'Ayush Bhatt', relatedTo: 'Ramesh Shukla', dueDate: new Date().toISOString().split('T')[0], priority: 'High', status: 'Completed' },
    { id: 't2', title: 'Prepare Lunch', category: 'Meal', assignee: 'Harsh Shukla', relatedTo: 'Ramesh Shukla', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium', status: 'Pending' },
    { id: 't3', title: 'Take to Doctor', category: 'Appointment', assignee: 'Harsh Shukla', relatedTo: 'Ramesh Shukla', dueDate: '2026-05-29', priority: 'High', status: 'Pending' },
    { id: 't4', title: 'House Cleaning', category: 'Lifestyle', assignee: 'Broja Kishor', relatedTo: 'Family', dueDate: '2026-05-30', priority: 'Low', status: 'Pending' }
  ],
  appointments: [
    { id: 'a1', doctor: 'Dr. Rahul Verma', type: 'Cardiologist', patient: 'Ramesh Shukla', date: '2026-05-29', time: '11:00 AM', status: 'Upcoming', notes: 'Regular Checkup' },
    { id: 'a2', doctor: 'Dr. Neha Singh', type: 'Physiotherapist', patient: 'Ramesh Shukla', date: '2026-06-02', time: '10:30 AM', status: 'Upcoming', notes: 'Session 3' },
    { id: 'a3', doctor: 'Eye Checkup', type: 'Optometrist', patient: 'Ramesh Shukla', date: '2026-05-20', time: '04:00 PM', status: 'Completed', notes: 'Vision Test' }
  ],
  documents: [
    { id: 'd1', name: 'Blood Test Report', category: 'Lab Reports', uploader: 'Harsh Shukla', member: 'Ramesh Shukla', date: '2026-05-25', size: '1.2 MB', type: 'PDF' },
    { id: 'd2', name: 'Chest X-Ray', category: 'Imaging', uploader: 'Ayush Bhatt', member: 'Ramesh Shukla', date: '2026-05-21', size: '2.4 MB', type: 'JPG' },
    { id: 'd3', name: 'Prescription - Dr. Verma', category: 'Prescriptions', uploader: 'Harsh Shukla', member: 'Ramesh Shukla', date: '2026-05-20', size: '850 KB', type: 'PDF' }
  ],
  settings: {
    theme: 'light', language: 'English', timeZone: 'IST (UTC +5:30)',
    notifications: { appointments: true, tasks: true, documents: false, updates: true },
    app: { autoBackup: true, offlineMode: true, dataSync: true },
    privacy: { visibility: 'Family Circle Only', sharing: false }
  }
};

const AppContext = createContext(null);

const AppProvider = ({ children }) => {
  const [db, setDb] = useLocalStorage('parivaar_saathi_db', SEED_DATA);
  const [currentUser, setCurrentUser] = useLocalStorage('parivaar_saathi_user', null);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [{ id: generateId(), message, type, time: new Date() }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.slice(0, prev.length -1)), 5000); // Auto remove
  };

  // Generic CRUD
  const addRecord = (table, record) => {
    setDb(prev => ({ ...prev, [table]: [{ ...record, id: generateId() }, ...prev[table]] }));
    addNotification(`${table.slice(0, -1)} added successfully`, 'success');
  };

  const updateRecord = (table, id, updates) => {
    setDb(prev => ({
      ...prev,
      [table]: prev[table].map(item => item.id === id ? { ...item, ...updates } : item)
    }));
    addNotification(`${table.slice(0, -1)} updated successfully`, 'success');
  };

  const deleteRecord = (table, id) => {
    setDb(prev => ({ ...prev, [table]: prev[table].filter(item => item.id !== id) }));
    addNotification(`${table.slice(0, -1)} deleted`, 'info');
  };

  // Auth Methods
  const login = (email, password) => {
    if (!email || !password) return false;
    
    // DEMO BYPASS: Allow any login to succeed for the prototype. 
    // It will log you in as the requested user if found, otherwise it defaults to Admin.
    let user = db.users.find(u => u.email === email);
    if (!user) {
      user = db.users[0]; // Default to Admin (Harsh Shukla) if email doesn't exist
    }
    
    setCurrentUser(user);
    addNotification(`Welcome back, ${user.name}!`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (userData) => {
    const newUser = { ...userData, id: generateId(), avatar: `https://placehold.co/100x100/4F46E5/FFFFFF?text=${userData.name.substring(0,2).toUpperCase()}` };
    setDb(prev => ({ ...prev, users: [...prev.users, newUser], members: [...prev.members, { id: generateId(), name: newUser.name, role: newUser.role, email: newUser.email, phone: newUser.phone, status: 'Active', initials: newUser.name.substring(0,2).toUpperCase(), color: 'bg-blue-500', permissions: 'Full Access' }] }));
    setCurrentUser(newUser);
    return true;
  };

  const updateSettings = (newSettings) => {
    setDb(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  }

  const value = {
    db, currentUser, login, logout, register, addRecord, updateRecord, deleteRecord, notifications, updateSettings
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useApp = () => useContext(AppContext);

// SVG Icons 
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
  Medications: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>,
  Reminders: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
  Tasks: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>,
  Appointments: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
  Documents: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>,
  Family: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
  Analytics: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>,
  Profile: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Search: () => <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
  Bell: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>,
  MoreVertical: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
};

// UI Components
const Card = ({ children, className = '', noPad=false }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${noPad ? '' : 'p-5'} ${className} transition-colors duration-200`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, colorClass }) => (
  <Card className="flex flex-col">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20 text-${colorClass.split('-')[1]}-600 dark:text-${colorClass.split('-')[1]}-400`}>
        <Icon />
      </div>
    </div>
    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">{subtitle}</p>}
  </Card>
);

const Badge = ({ children, type = 'default' }) => {
  const styles = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[type] || styles.default}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'primary', className = '', onClick, type="button", icon: Icon }) => {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500"
  };
  
  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <span className="mr-2"><Icon /></span>}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Icons.X /></button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Delete</Button>
    </div>
  </Modal>
);

const FormGroup = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white transition-colors" {...props} />
);

const Select = ({ children, ...props }) => (
  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white transition-colors" {...props}>
    {children}
  </select>
);

const Toggle = ({ enabled, onChange }) => (
  <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const DashboardView = () => {
  const { db } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingTasks = db.tasks.filter(t => t.status === 'Pending').length;
  const upcomingAppts = db.appointments.filter(a => a.status === 'Upcoming').length;
  const todayReminders = db.reminders.filter(r => r.date === todayStr);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your family care today.</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border dark:border-gray-700 shadow-sm">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Icons.Medications} title="Medications" value={db.medications.length} subtitle="Total Medicines" colorClass="bg-blue-500" />
        <StatCard icon={Icons.Reminders} title="Reminders" value={todayReminders.length} subtitle="Due Today" colorClass="bg-yellow-500" />
        <StatCard icon={Icons.Appointments} title="Appointments" value={upcomingAppts} subtitle="Upcoming" colorClass="bg-purple-500" />
        <StatCard icon={Icons.Tasks} title="Care Tasks" value={pendingTasks} subtitle="Pending Tasks" colorClass="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center"><Icons.Tasks /> <span className="ml-2">Today's Schedule</span></h3>
          </div>
          {todayReminders.length > 0 ? (
            <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-3 space-y-8">
              {todayReminders.map((item) => (
                <div key={item.id} className="relative pl-6">
                  <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${item.status === 'Completed' ? 'bg-green-500' : item.status === 'Skipped' ? 'bg-gray-500' : 'bg-blue-500'}`}></span>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{item.time}</span>
                      <h4 className="font-bold text-gray-900 dark:text-white mt-1">{item.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.member}</p>
                    </div>
                    <Badge type={item.status === 'Completed' ? 'success' : item.status === 'Pending' ? 'warning' : item.status === 'Skipped' ? 'default' : 'danger'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">No scheduled items for today.</p>
          )}
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center"><Icons.Appointments /> <span className="ml-2">Upcoming Appts</span></h3>
          </div>
          <div className="space-y-4">
            {db.appointments.filter(a => a.status === 'Upcoming').slice(0,3).map((apt) => (
              <div key={apt.id} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent transition-colors">
                <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 min-w-[60px]">
                  <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{new Date(apt.date).getDate()}</span>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-500 uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{apt.doctor}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{apt.type} • {apt.time}</p>
                </div>
              </div>
            ))}
            {upcomingAppts === 0 && <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

const MedicationsView = () => {
  const { db, addRecord, updateRecord, deleteRecord, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const canEdit = ['Admin', 'Caregiver'].includes(currentUser?.role);

  const filtered = useMemo(() => {
    return db.medications.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.member.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [db.medications, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) updateRecord('medications', editingId, formData);
    else addRecord('medications', { ...formData, status: 'Active' });
    setIsModalOpen(false);
  };

  const openForm = (med = null) => {
    setFormData(med || { name: '', type: '', member: db.patient.name, frequency: 'Once a day', timing: 'Morning', time: '09:00 AM', startDate: new Date().toISOString().split('T')[0] });
    setEditingId(med?.id || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medications</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage family members' medications.</p>
        </div>
        {canEdit && <Button icon={Icons.Plus} onClick={() => openForm()}>Add Medication</Button>}
      </div>

      <Card noPad>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icons.Search /></span>
            <Input type="text" className="pl-10" placeholder="Search medications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                {canEdit && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((med) => (
                <tr key={med.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{med.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{med.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">{med.member}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-300">{med.frequency}</div>
                    <div className="text-xs text-gray-500">{med.timing} • {med.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge type={med.status === 'Active' ? 'success' : 'default'}>{med.status}</Badge>
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openForm(med)} className="text-blue-600 hover:text-blue-900 mr-3"><Icons.Edit /></button>
                      <button onClick={() => setConfirmDelete(med.id)} className="text-red-600 hover:text-red-900"><Icons.Trash /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No medications found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Medication" : "Add Medication"}>
        <form onSubmit={handleSubmit}>
          <FormGroup label="Medication Name"><Input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></FormGroup>
          <FormGroup label="Type (e.g., Pain Relief)"><Input required value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} /></FormGroup>
          <FormGroup label="Member">
            <Select value={formData.member || ''} onChange={e => setFormData({...formData, member: e.target.value})}>
              <option value={db.patient.name}>{db.patient.name}</option>
              {db.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </Select>
          </FormGroup>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Frequency">
              <Select value={formData.frequency || ''} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                <option>Once a day</option><option>Twice a day</option><option>As needed</option>
              </Select>
            </FormGroup>
            <FormGroup label="Time"><Input type="time" required value={formData.time || ''} onChange={e => setFormData({...formData, time: e.target.value})} /></FormGroup>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Medication</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => deleteRecord('medications', confirmDelete)} title="Delete Medication" message="Are you sure you want to remove this medication?" />
    </div>
  );
};

const CareTasksView = () => {
  const { db, addRecord, updateRecord, deleteRecord, currentUser } = useApp();
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  const canEdit = ['Admin', 'Caregiver'].includes(currentUser?.role);

  const filtered = useMemo(() => {
    let res = db.tasks;
    if (filter === 'Pending') res = res.filter(t => t.status === 'Pending' || t.status === 'Overdue');
    if (filter === 'Completed') res = res.filter(t => t.status === 'Completed');
    if (filter === 'Mine') res = res.filter(t => t.assignee === currentUser.name);
    return res;
  }, [db.tasks, filter, currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) updateRecord('tasks', formData.id, formData);
    else addRecord('tasks', { ...formData, status: 'Pending' });
    setIsModalOpen(false);
  };

  const toggleStatus = (task) => {
    updateRecord('tasks', task.id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Care Tasks</h1>
          <p className="text-gray-500 mt-1">Assign and track care responsibilities.</p>
        </div>
        {canEdit && <Button icon={Icons.Plus} onClick={() => { setFormData({title:'', category:'Health', assignee: currentUser.name, dueDate: new Date().toISOString().split('T')[0], priority: 'Medium'}); setIsModalOpen(true);}}>Add Task</Button>}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Pending', 'Completed', 'Mine'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>{f}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(task => (
          <Card key={task.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-3">
               <Badge type={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'info'}>{task.priority}</Badge>
               {canEdit && (
                 <div className="flex gap-2">
                    <button onClick={() => {setFormData(task); setIsModalOpen(true);}} className="text-gray-400 hover:text-blue-500"><Icons.Edit /></button>
                    <button onClick={() => setConfirmDelete(task.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
                 </div>
               )}
            </div>
            <h4 className={`font-bold text-lg mb-1 ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{task.title}</h4>
            <p className="text-sm text-gray-500 mb-4 flex-1">Due: {task.dueDate} • Assigned to: {task.assignee}</p>
            <Button variant={task.status === 'Completed' ? 'secondary' : 'primary'} className="w-full" onClick={() => toggleStatus(task)}>
               {task.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
            </Button>
          </Card>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-10 text-center text-gray-500">No tasks found.</div>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Task" : "Add Task"}>
        <form onSubmit={handleSubmit}>
          <FormGroup label="Task Title"><Input required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} /></FormGroup>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Category">
              <Select value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option>Health</option><option>Meal</option><option>Appointment</option><option>Lifestyle</option>
              </Select>
            </FormGroup>
            <FormGroup label="Priority">
              <Select value={formData.priority || ''} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
              </Select>
            </FormGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Assign To">
              <Select value={formData.assignee || ''} onChange={e => setFormData({...formData, assignee: e.target.value})}>
                {db.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Due Date"><Input type="date" required value={formData.dueDate || ''} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></FormGroup>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Task</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => deleteRecord('tasks', confirmDelete)} title="Delete Task" message="Are you sure you want to delete this task?" />
    </div>
  );
};

const RemindersView = () => {
  const { db, addRecord, updateRecord, deleteRecord } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  const handleStatus = (id, status) => updateRecord('reminders', id, { status });
  const handleSubmit = (e) => {
    e.preventDefault();
    addRecord('reminders', { ...formData, status: 'Pending' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reminders</h1>
        <Button icon={Icons.Plus} onClick={() => { setFormData({title:'', type:'Medication', time:'09:00', date: new Date().toISOString().split('T')[0]}); setIsModalOpen(true);}}>Add</Button>
      </div>
      <Card noPad>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {db.reminders.map(rem => (
            <div key={rem.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${rem.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}><Icons.Bell /></div>
                <div>
                  <h4 className={`font-bold ${rem.status==='Completed'?'line-through text-gray-400':'text-gray-900 dark:text-white'}`}>{rem.title}</h4>
                  <p className="text-sm text-gray-500">{rem.date} • {rem.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {rem.status !== 'Completed' && <Button variant="secondary" onClick={() => handleStatus(rem.id, 'Skipped')}>Skip</Button>}
                {rem.status !== 'Completed' && <Button onClick={() => handleStatus(rem.id, 'Completed')}>Complete</Button>}
                <button onClick={() => deleteRecord('reminders', rem.id)} className="p-2 text-gray-400 hover:text-red-500"><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Reminder">
        <form onSubmit={handleSubmit}>
          <FormGroup label="Title"><Input required value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})} /></FormGroup>
          <div className="grid grid-cols-2 gap-4">
             <FormGroup label="Date"><Input type="date" required value={formData.date||''} onChange={e=>setFormData({...formData, date:e.target.value})} /></FormGroup>
             <FormGroup label="Time"><Input type="time" required value={formData.time||''} onChange={e=>setFormData({...formData, time:e.target.value})} /></FormGroup>
          </div>
          <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={()=>setIsModalOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Modal>
    </div>
  );
};

const AppointmentsView = () => {
  const { db, addRecord, updateRecord, deleteRecord } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
        <Button icon={Icons.Plus} onClick={() => { setFormData({doctor:'', type:'', date: new Date().toISOString().split('T')[0], time:'10:00'}); setIsModalOpen(true);}}>Book</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.appointments.map(apt => (
          <Card key={apt.id}>
             <div className="flex justify-between items-start mb-2">
               <Badge type={apt.status==='Upcoming'?'info':apt.status==='Completed'?'success':'danger'}>{apt.status}</Badge>
               <button onClick={() => deleteRecord('appointments', apt.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
             </div>
             <h3 className="font-bold text-lg dark:text-white">{apt.doctor}</h3>
             <p className="text-sm text-gray-500 mb-4">{apt.type}</p>
             <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300">
               <p><strong>Date:</strong> {apt.date}</p>
               <p><strong>Time:</strong> {apt.time}</p>
             </div>
             {apt.status === 'Upcoming' && (
                <Button variant="secondary" className="w-full mt-4" onClick={() => updateRecord('appointments', apt.id, {status:'Completed'})}>Mark Completed</Button>
             )}
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Appointment">
        <form onSubmit={e => { e.preventDefault(); addRecord('appointments', {...formData, status:'Upcoming'}); setIsModalOpen(false); }}>
          <FormGroup label="Doctor Name"><Input required value={formData.doctor||''} onChange={e=>setFormData({...formData, doctor:e.target.value})} /></FormGroup>
          <FormGroup label="Specialty"><Input required value={formData.type||''} onChange={e=>setFormData({...formData, type:e.target.value})} /></FormGroup>
          <div className="grid grid-cols-2 gap-4">
             <FormGroup label="Date"><Input type="date" required value={formData.date||''} onChange={e=>setFormData({...formData, date:e.target.value})} /></FormGroup>
             <FormGroup label="Time"><Input type="time" required value={formData.time||''} onChange={e=>setFormData({...formData, time:e.target.value})} /></FormGroup>
          </div>
          <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={()=>setIsModalOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Modal>
    </div>
  );
};

const DocumentsView = () => {
  const { db, addRecord, deleteRecord, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Calculate file size in MB or KB
      let sizeStr = '';
      if (file.size > 1024 * 1024) {
        sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      } else {
        sizeStr = (file.size / 1024).toFixed(0) + ' KB';
      }
      
      setFormData({
        ...formData,
        name: file.name.split('.')[0], // Remove extension for name
        size: sizeStr,
        type: file.name.split('.').pop().toUpperCase()
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Vault</h1>
        <Button icon={Icons.Plus} onClick={() => { setFormData({name:'', category:'Lab Reports'}); setIsModalOpen(true);}}>Upload</Button>
      </div>
      <Card noPad>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {db.documents.map(doc => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Icons.Documents /></div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{doc.name}</h4>
                  <p className="text-xs text-gray-500">{doc.category} • {doc.size} • Uploaded by {doc.uploader}</p>
                </div>
              </div>
              <button onClick={() => deleteRecord('documents', doc.id)} className="p-2 text-gray-400 hover:text-red-500"><Icons.Trash /></button>
            </div>
          ))}
        </div>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document">
        <form onSubmit={e => { e.preventDefault(); addRecord('documents', {...formData, uploader: currentUser.name, date: new Date().toISOString().split('T')[0], size: formData.size || 'Unknown'}); setIsModalOpen(false); }}>
          <FormGroup label="Document Name"><Input required value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="e.g. Blood Test Report" /></FormGroup>
          <FormGroup label="Category">
             <Select value={formData.category||'Lab Reports'} onChange={e=>setFormData({...formData, category:e.target.value})}>
               <option>Lab Reports</option><option>Prescriptions</option><option>Imaging</option><option>Medical Certificate</option><option>Insurance</option>
             </Select>
          </FormGroup>
          
          <div 
            className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full mb-3">
               <Icons.Upload /> 
               {/* Fallback to simple SVG if Icons.Upload is not in Icons dict */}
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Click to select file from your device</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Simulated Upload)</p>
            {formData.size && (
              <div className="mt-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center">
                <Icons.Check /> File Selected: {formData.size}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={()=>setIsModalOpen(false)}>Cancel</Button><Button type="submit" disabled={!formData.name}>Upload</Button></div>
        </form>
      </Modal>
    </div>
  );
};

const FamilyCircleView = () => {
  const { db, addRecord, deleteRecord, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Family Circle</h1>
        {currentUser?.role === 'Admin' && <Button icon={Icons.Plus} onClick={() => { setFormData({name:'', role:'Caregiver', email:''}); setIsModalOpen(true);}}>Add Member</Button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.members.map(member => (
          <Card key={member.id} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${member.color || 'bg-blue-500'}`}>{member.initials}</div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white">{member.name} {member.id === currentUser?.id && '(You)'}</h4>
              <p className="text-sm text-gray-500">{member.role} • {member.permissions}</p>
            </div>
            {currentUser?.role === 'Admin' && member.id !== currentUser.id && (
              <button onClick={() => deleteRecord('members', member.id)} className="text-gray-400 hover:text-red-500"><Icons.Trash /></button>
            )}
          </Card>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Family Member">
        <form onSubmit={e => { e.preventDefault(); addRecord('members', {...formData, initials: formData.name.substring(0,2).toUpperCase(), color:'bg-gray-500', status:'Active', permissions:'Manage Care'}); setIsModalOpen(false); }}>
          <FormGroup label="Name"><Input required value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})} /></FormGroup>
          <FormGroup label="Email"><Input type="email" required value={formData.email||''} onChange={e=>setFormData({...formData, email:e.target.value})} /></FormGroup>
          <FormGroup label="Role">
             <Select value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})}>
               <option>Caregiver</option><option>Observer</option><option>Doctor</option>
             </Select>
          </FormGroup>
          <div className="flex justify-end gap-3 mt-4"><Button variant="secondary" onClick={()=>setIsModalOpen(false)}>Cancel</Button><Button type="submit">Add</Button></div>
        </form>
      </Modal>
    </div>
  );
};

const AnalyticsView = () => {
  const { db } = useApp();
  const completedTasks = db.tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = db.tasks.length - completedTasks;
  const adherence = db.reminders.length ? Math.round((db.reminders.filter(r=>r.status==='Completed').length / db.reminders.length) * 100) : 100;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Icons.Check} title="Care Tasks Completed" value={completedTasks} colorClass="bg-green-500" />
        <StatCard icon={Icons.Tasks} title="Tasks Pending" value={pendingTasks} colorClass="bg-yellow-500" />
        <StatCard icon={Icons.Bell} title="Medication Adherence" value={`${adherence}%`} colorClass="bg-blue-500" />
      </div>
      <Card>
        <h3 className="font-bold text-lg mb-6 dark:text-white">Task Distribution</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
             <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
               <path className="text-green-500 stroke-current" strokeWidth="4" fill="none" strokeDasharray={`${(completedTasks/db.tasks.length)*100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               <path className="text-yellow-500 stroke-current" strokeWidth="4" fill="none" strokeDasharray={`${(pendingTasks/db.tasks.length)*100}, 100`} strokeDashoffset={`-${(completedTasks/db.tasks.length)*100}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
             </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Completed ({completedTasks})</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Pending ({pendingTasks})</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ProfileSettingsView = () => {
  const { currentUser, db, updateSettings } = useApp();
  const [settings, setSettings] = useState(db.settings);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    handleSettingChange('theme', newTheme);
    if(newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleSettingChange = (key, value, nestedObj = null) => {
    let newSettings = { ...settings };
    if (nestedObj) {
      newSettings[nestedObj] = { ...newSettings[nestedObj], [key]: value };
    } else {
      newSettings[key] = value;
    }
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings & Preferences</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your application preferences and security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center">
              <img src={currentUser?.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 dark:border-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser?.name}</h3>
              <p className="text-gray-500 mb-2">{currentUser?.email}</p>
              <Badge type="info">{currentUser?.role}</Badge>
            </div>
            <div className="mt-6 space-y-3 pt-6 border-t border-gray-100 dark:border-gray-700">
               <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium dark:text-white">{currentUser?.phone}</span></div>
               <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="font-medium text-green-600">Active</span></div>
            </div>
            <Button variant="secondary" className="w-full mt-6">Edit Profile</Button>
          </Card>

          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">General Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Dark Mode</span>
                <Toggle enabled={settings.theme === 'dark'} onChange={toggleTheme} />
              </div>
              <FormGroup label="Language">
                <Select value={settings.language} onChange={(e) => handleSettingChange('language', e.target.value)}>
                  <option>English</option><option>Hindi</option><option>Spanish</option>
                </Select>
              </FormGroup>
              <FormGroup label="Time Zone">
                <Select value={settings.timeZone} onChange={(e) => handleSettingChange('timeZone', e.target.value)}>
                  <option>IST (UTC +5:30)</option><option>EST (UTC -5:00)</option><option>GMT (UTC +0:00)</option>
                </Select>
              </FormGroup>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><Icons.Bell /> Notification Preferences</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                 <div><p className="font-medium text-gray-900 dark:text-white">Appointment Alerts</p><p className="text-xs text-gray-500">Get notified for upcoming appointments</p></div>
                 <Toggle enabled={settings.notifications.appointments} onChange={() => handleSettingChange('appointments', !settings.notifications.appointments, 'notifications')} />
               </div>
               <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                 <div><p className="font-medium text-gray-900 dark:text-white">Care Task Updates</p><p className="text-xs text-gray-500">Notifications when tasks are assigned or completed</p></div>
                 <Toggle enabled={settings.notifications.tasks} onChange={() => handleSettingChange('tasks', !settings.notifications.tasks, 'notifications')} />
               </div>
               <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                 <div><p className="font-medium text-gray-900 dark:text-white">Document Uploads</p><p className="text-xs text-gray-500">Alerts when new medical documents are added</p></div>
                 <Toggle enabled={settings.notifications.documents} onChange={() => handleSettingChange('documents', !settings.notifications.documents, 'notifications')} />
               </div>
               <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                 <div><p className="font-medium text-gray-900 dark:text-white">System Announcements</p><p className="text-xs text-gray-500">Important updates about Parivaar Saathi</p></div>
                 <Toggle enabled={settings.notifications.updates} onChange={() => handleSettingChange('updates', !settings.notifications.updates, 'notifications')} />
               </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2"><Icons.Settings /> Application Settings</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                 <div><p className="font-medium text-gray-900 dark:text-white">Offline Mode</p><p className="text-xs text-gray-500">Access limited features without internet</p></div>
                 <Toggle enabled={settings.app.offlineMode} onChange={() => handleSettingChange('offlineMode', !settings.app.offlineMode, 'app')} />
               </div>
               <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                 <div><p className="font-medium text-gray-900 dark:text-white">Auto Backup</p><p className="text-xs text-gray-500">Automatically backup data to cloud</p></div>
                 <Toggle enabled={settings.app.autoBackup} onChange={() => handleSettingChange('autoBackup', !settings.app.autoBackup, 'app')} />
               </div>
               <div className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                 <div><p className="font-medium text-gray-900 dark:text-white">Data Syncing</p><p className="text-xs text-gray-500">Sync data across all your devices</p></div>
                 <Toggle enabled={settings.app.dataSync} onChange={() => handleSettingChange('dataSync', !settings.app.dataSync, 'app')} />
               </div>
            </div>
          </Card>
          
          <Card>
            <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">Danger Zone</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <div><p className="font-medium text-gray-900 dark:text-white">Deactivate Account</p><p className="text-xs text-gray-500">Temporarily disable your account</p></div>
                 <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20">Deactivate</Button>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LoginView = () => {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'Caregiver' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      if(!form.name || !form.email || !form.password) return setError("All fields required");
      register(form);
    } else {
      const ok = login(form.email, form.password);
      if (!ok) setError("Invalid credentials. Use harsh@gmail.com / password123");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 dark:bg-blue-900/20 flex-col justify-center items-center p-12">
         <div className="text-center max-w-md">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-6">P</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Care Together.<br/>Stay Connected.</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Manage medications, appointments, tasks, and health documents securely.</p>
         </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{isRegister ? 'Create Account' : 'Welcome Back!'}</h2>
          <p className="text-gray-500 mb-8">{isRegister ? 'Join Parivaar Saathi' : 'Login to your account'}</p>
          
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-sm">{error}</div>}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && <FormGroup label="Full Name"><Input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="John Doe" /></FormGroup>}
            <FormGroup label="Email"><Input required type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="email@example.com" /></FormGroup>
            <FormGroup label="Password"><Input required type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="••••••••" /></FormGroup>
            {isRegister && (
              <FormGroup label="Role">
                <Select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                  <option>Caregiver</option><option>Admin</option><option>Care Receiver</option>
                </Select>
              </FormGroup>
            )}
            <Button type="submit" className="w-full py-3">{isRegister ? 'Register' : 'Login'}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"} 
            <button type="button" onClick={() => {setIsRegister(!isRegister); setError('');}} className="font-bold text-blue-600 ml-1 hover:underline">{isRegister ? 'Login' : 'Register'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const { currentUser, logout, notifications, db } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if(db.settings.theme === 'dark') document.documentElement.classList.add('dark');
  }, [db.settings.theme]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'medications', label: 'Medications', icon: Icons.Medications },
    { id: 'reminders', label: 'Reminders', icon: Icons.Reminders },
    { id: 'tasks', label: 'Care Tasks', icon: Icons.Tasks },
    { id: 'appointments', label: 'Appointments', icon: Icons.Appointments },
    { id: 'documents', label: 'Documents', icon: Icons.Documents },
    { id: 'family', label: 'Family Circle', icon: Icons.Family },
    { id: 'analytics', label: 'Analytics', icon: Icons.Analytics },
    { id: 'profile', label: 'Settings', icon: Icons.Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'medications': return <MedicationsView />;
      case 'tasks': return <CareTasksView />;
      case 'reminders': return <RemindersView />;
      case 'appointments': return <AppointmentsView />;
      case 'documents': return <DocumentsView />;
      case 'family': return <FamilyCircleView />;
      case 'analytics': return <AnalyticsView />;
      case 'profile': return <ProfileSettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-200">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in-up ${n.type === 'success' ? 'bg-green-600' : n.type==='danger'?'bg-red-600':'bg-blue-600'}`}>
            {n.message}
          </div>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B1E42] text-white">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
           <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-lg">P</div>
           <span className="text-xl font-bold tracking-tight">ParivaarSaathi</span>
        </div>
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white border-l-4 border-white' : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'}`}>
              <item.icon className="mr-3" /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-500 dark:text-gray-300 p-2"><Icons.MoreVertical /></button>
            <span className="ml-2 font-bold text-[#0B1E42] dark:text-white">ParivaarSaathi</span>
          </div>
          <div className="hidden md:block flex-1"></div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><Icons.Bell /></button>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-600 mx-2"></div>
            <div className="flex items-center gap-3 relative group">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-gray-900 dark:text-white">{currentUser?.name}</div>
                <div className="text-xs text-gray-500">{currentUser?.role}</div>
              </div>
              <img src={currentUser?.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover cursor-pointer" onClick={() => setActiveTab('profile')} />
              <button onClick={logout} className="text-xs text-red-500 hover:underline font-medium">Logout</button>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
           <div className="max-w-7xl mx-auto pb-10">
              {renderContent()}
           </div>
        </div>
      </main>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 left-0 w-64 h-full bg-[#0B1E42] text-white p-4">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-xl">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><Icons.X /></button>
            </div>
            <div className="space-y-2">
               {navItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === item.id ? 'bg-blue-600' : ''}`}>
                  <item.icon className="mr-3" /> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MainApp = () => {
  const { currentUser } = useApp();
  return currentUser ? <Layout /> : <LoginView />;
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EntryForm } from './pages/EntryForm';
import { History } from './pages/History';
import { Stats } from './pages/Stats';
import { AdminTeachers } from './pages/AdminTeachers';
import { AdminSubjects } from './pages/AdminSubjects';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { StorageService } from './services/storageService';
import { User, AppRoute, LessonEntry } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [editingEntry, setEditingEntry] = useState<LessonEntry | null>(null);
  const [dataVersion, setDataVersion] = useState(0); // Used to force re-renders on data change

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentRoute(AppRoute.DASHBOARD);
    }
  }, []);

  const reloadData = () => setDataVersion(v => v + 1);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setCurrentRoute(AppRoute.LOGIN);
  };

  const handleNavigate = (route: AppRoute) => {
    // If navigating to the entry form via a main nav link, it's a new entry, so clear any editing state.
    if (route === AppRoute.ENTRY) {
      setEditingEntry(null);
    }
    setCurrentRoute(route);
  };

  const handleEdit = (entry: LessonEntry) => {
    setEditingEntry(entry);
    setCurrentRoute(AppRoute.ENTRY);
  };

  const handleDelete = (id: string) => {
    StorageService.deleteEntry(id);
    reloadData();
  };

  const handleSave = () => {
    setEditingEntry(null);
    reloadData();
    setCurrentRoute(AppRoute.HISTORY);
  };

  const renderContent = () => {
    if (!currentUser) return <Login onLogin={handleLogin} />;

    switch (currentRoute) {
      case AppRoute.DASHBOARD:
        return <Dashboard currentUser={currentUser} onNavigate={handleNavigate} />;
      case AppRoute.ENTRY:
        return <EntryForm 
                  currentUser={currentUser} 
                  onNavigate={handleNavigate} 
                  editingEntry={editingEntry}
                  onSave={handleSave}
                />;
      case AppRoute.HISTORY:
        return <History 
                  key={dataVersion} 
                  currentUser={currentUser} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />;
      case AppRoute.STATS:
        return <Stats currentUser={currentUser} />;
      case AppRoute.ADMIN_TEACHERS:
        return <AdminTeachers />;
      case AppRoute.ADMIN_SUBJECTS:
        return <AdminSubjects />;
      default:
        return <Dashboard currentUser={currentUser} onNavigate={handleNavigate} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar 
        currentUser={currentUser} 
        currentRoute={currentRoute} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 md:ml-64 min-h-screen">
        {renderContent()}
      </main>

      <MobileNav currentRoute={currentRoute} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;

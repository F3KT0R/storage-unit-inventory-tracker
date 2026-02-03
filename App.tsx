
import React, { useState, useCallback } from 'react';
import { UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import { PackageIcon } from './components/icons/PackageIcon';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GUEST);

  const handleLogin = useCallback((role: UserRole) => {
    setUserRole(role);
  }, []);

  const handleLogout = useCallback(() => {
    setUserRole(UserRole.GUEST);
  }, []);

  const renderContent = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return <AdminDashboard onLogout={handleLogout} />;
      case UserRole.USER:
        return <UserDashboard onLogout={handleLogout} />;
      case UserRole.GUEST:
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PackageIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Storage Inventory</h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; 2024 Storage Unit Inventory App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
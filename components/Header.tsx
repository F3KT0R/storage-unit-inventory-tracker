
import React from 'react';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  title: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md hover:shadow-lg"
      >
        <LogoutIcon className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Header;

import React from 'react';
import { UserRole } from '../types';
import { UserIcon } from './icons/UserIcon';
import { AdminIcon } from './icons/AdminIcon';


interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Welcome!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Please select your role to continue.</p>
        <div className="space-y-4">
          <button
            onClick={() => onLogin(UserRole.ADMIN)}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <AdminIcon className="h-6 w-6" />
            <span>Login as Admin</span>
          </button>
          <button
            onClick={() => onLogin(UserRole.USER)}
            className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            <UserIcon className="h-6 w-6" />
            <span>Login as User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

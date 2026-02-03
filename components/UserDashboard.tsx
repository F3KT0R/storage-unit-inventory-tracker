import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getPackages, getUsers } from '../services/mockApi';
import { Package, PackageStatus, User } from '../types';
import PackageList from './PackageList';
import Header from './Header';

interface UserDashboardProps {
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onLogout }) => {
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurname, setSelectedSurname] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [packagesData, usersData] = await Promise.all([getPackages(), getUsers()]);
      setAllPackages(packagesData.filter(p => p.status === PackageStatus.IN_STORAGE));
      setUsers(usersData);
      if (usersData.length > 0 && !selectedSurname) {
        setSelectedSurname(usersData[0].name);
      }
    } catch (err) {
      setError('Could not connect to the backend. Please ensure the API server is running and accessible.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSurname]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const surnames = users.map(user => user.name);

  const filteredPackages = useMemo(() => {
    if (!selectedSurname) return [];
    return allPackages.filter(p => p.surname === selectedSurname);
  }, [allPackages, selectedSurname]);

  const summary = useMemo(() => {
    const totalWeight = filteredPackages.reduce((acc, pkg) => acc + pkg.weight, 0);
    const packageCount = filteredPackages.length;
    return { totalWeight, packageCount };
  }, [filteredPackages]);

  if (isLoading) {
    return (
        <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="space-y-6">
            <Header onLogout={onLogout} title="User Dashboard" />
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md" role="alert">
                <p className="font-bold text-lg">Connection Error</p>
                <p className="mb-4">{error}</p>
                <button
                    onClick={fetchData}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header onLogout={onLogout} title="User Dashboard" />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <label htmlFor="surname-select" className="font-semibold text-gray-700 dark:text-gray-200">
            Select Surname:
          </label>
          <select
            id="surname-select"
            value={selectedSurname}
            onChange={(e) => setSelectedSurname(e.target.value)}
            className="block w-full md:w-64 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading || surnames.length === 0}
          >
            {surnames.map(surname => (
              <option key={surname} value={surname}>{surname}</option>
            ))}
          </select>
        </div>

        {selectedSurname && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Total Packages</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">{summary.packageCount}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-300 font-medium">Collective Weight</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-100">{summary.totalWeight.toFixed(2)} kg</p>
            </div>
          </div>
        )}
      </div>

      <PackageList
        packages={filteredPackages}
        isLoading={isLoading}
        isAdmin={false}
        filterSurname={selectedSurname}
        surnames={surnames}
      />
    </div>
  );
};

export default UserDashboard;

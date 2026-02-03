import React, { useState, useEffect, useCallback } from 'react';
import { getPackages, addPackage, updatePackageStatus, getUsers, addUser } from '../services/mockApi';
import { Package, PackageStatus, User } from '../types';
import PackageForm from './PackageForm';
import PackageList from './PackageList';
import Header from './Header';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [packagesData, usersData] = await Promise.all([getPackages(), getUsers()]);
      setPackages(packagesData);
      setUsers(usersData);
    } catch (err) {
      setError('Could not connect to the backend. Please ensure the API server is running and accessible.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPackage = async (
    newPackageData: Omit<Package, 'arrivalDate' | 'status'>,
    emailOptions?: { sendNotification: boolean; notificationMessage?: string }
  ): Promise<void> => {
    try {
      await addPackage(newPackageData, emailOptions);
      const data = await getPackages(); // Refetch packages
      setPackages(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while adding the package.');
      }
      throw err; // re-throw to inform the form component
    }
  };

  const handleChangeStatus = async (id: string, status: PackageStatus) => {
    try {
      await updatePackageStatus(id, status);
      const data = await getPackages(); // Refetch packages
      setPackages(data);
    } catch (err) {
      setError('Failed to update package status.');
      console.error(err);
    }
  };

  const handleAddUser = async (name: string, email: string): Promise<void> => {
    try {
      await addUser(name, email);
      const data = await getUsers(); // Refetch users
      setUsers(data);
    } catch (err) {
      if (err instanceof Error) {
        throw err; // Re-throw to let the form component handle it
      } else {
        throw new Error('Failed to add user');
      }
    }
  };

  const surnames = users.map(u => u.name);

  if (isLoading) {
    return (
        <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
    );
  }

  if (error && users.length === 0) {
    return (
        <div className="space-y-6">
            <Header onLogout={onLogout} title="Admin Dashboard" />
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
      <Header onLogout={onLogout} title="Admin Dashboard" />
      {error && !users.length && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PackageForm onAddPackage={handleAddPackage} surnames={surnames} users={users} onAddUser={handleAddUser} />
        </div>
        <div className="lg:col-span-2">
          <PackageList
            packages={packages}
            isLoading={isLoading}
            onStatusChange={handleChangeStatus}
            isAdmin={true}
            surnames={surnames}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

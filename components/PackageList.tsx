import React, { useMemo, useState } from 'react';
import { Package, PackageStatus } from '../types';
import { TruckIcon } from './icons/TruckIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface PackageListProps {
  packages: Package[];
  isLoading: boolean;
  isAdmin: boolean;
  onStatusChange?: (id: string, status: PackageStatus) => void;
  filterSurname?: string;
  surnames: string[];
}

const PackageListItem: React.FC<{ pkg: Package; isAdmin: boolean; onStatusChange?: (id: string, status: PackageStatus) => void; }> = ({ pkg, isAdmin, onStatusChange }) => {
    const arrivalDate = new Date(pkg.arrivalDate);
    const formattedDate = `${arrivalDate.toLocaleDateString()} ${arrivalDate.toLocaleTimeString()}`;

    return (
        <li className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition duration-300 hover:shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-grow">
                <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{pkg.surname}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">ID: {pkg.id}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-gray-700 dark:text-gray-300">
                    <span>Weight: <strong>{pkg.weight} kg</strong></span>
                    <span>Arrived: <strong>{formattedDate}</strong></span>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${pkg.status === PackageStatus.IN_STORAGE ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {pkg.status === PackageStatus.IN_STORAGE ? <ArchiveBoxIcon className="h-4 w-4" /> : <TruckIcon className="h-4 w-4" />}
                    {pkg.status}
                </span>
                {isAdmin && pkg.status === PackageStatus.IN_STORAGE && onStatusChange && (
                    <button
                        onClick={() => onStatusChange(pkg.id, PackageStatus.DELIVERED)}
                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md transition duration-200 text-sm shadow-sm"
                    >
                        <TruckIcon className="h-4 w-4" />
                        <span>Mark as Delivered</span>
                    </button>
                )}
            </div>
        </li>
    );
};


const PackageList: React.FC<PackageListProps> = ({ packages, isLoading, isAdmin, onStatusChange, filterSurname: initialFilter, surnames }) => {
  const [filter, setFilter] = useState(initialFilter || 'All');

  const filteredPackages = useMemo(() => {
    const activePackages = packages.filter(p => p.status === PackageStatus.IN_STORAGE);
    if (filter === 'All') {
      return activePackages;
    }
    return activePackages.filter(p => p.surname === filter);
  }, [packages, filter]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Package List</h3>
        {isAdmin && (
          <div className="w-full sm:w-auto">
            <label htmlFor="admin-filter" className="sr-only">Filter by surname</label>
            <select
              id="admin-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="All">All Surnames</option>
              {surnames.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {filteredPackages.length > 0 ? (
        <ul className="space-y-4">
          {filteredPackages.map(pkg => (
            <PackageListItem key={pkg.id} pkg={pkg} isAdmin={isAdmin} onStatusChange={onStatusChange} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'All' ? 'No packages currently in storage.' : `No packages in storage for ${filter}.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PackageList;

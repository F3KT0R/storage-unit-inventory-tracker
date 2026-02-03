import React, { useState, useEffect } from 'react';
import { Package, User } from '../types';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { QrReader } from 'react-qr-reader';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import AddUserModal from './AddUserModal';


interface PackageFormProps {
  onAddPackage: (newPackageData: Omit<Package, 'arrivalDate' | 'status'>, emailOptions?: EmailNotificationOptions) => Promise<void>;
  surnames: string[];
  users: User[];
  onAddUser: (name: string, email: string) => Promise<void>;
}

interface EmailNotificationOptions {
  sendNotification: boolean;
  notificationMessage?: string;
}

const PackageForm: React.FC<PackageFormProps> = ({ onAddPackage, surnames, users, onAddUser }) => {
  const [id, setId] = useState('');
  const [surname, setSurname] = useState('');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    if (surnames.length > 0 && !surname) {
      setSurname(surnames[0]);
    }
  }, [surnames, surname]);

  // Update selected user when surname changes
  useEffect(() => {
    if (surname && users.length > 0) {
      const user = users.find(u => u.name.toLowerCase().includes(surname.toLowerCase()));
      setSelectedUser(user || null);
    }
  }, [surname, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !surname || !weight) {
      setError('All fields are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const emailOptions: EmailNotificationOptions = {
        sendNotification: sendEmailNotification,
        notificationMessage: customMessage.trim() || undefined
      };

      await onAddPackage({
        id,
        surname,
        weight: parseFloat(weight),
        status: 'in_storage'
      }, emailOptions);

      // Reset form on success
      setId('');
      setSurname(surnames.length > 0 ? surnames[0] : '');
      setWeight('');
      setShowScanner(false);
      setCustomMessage('');
      setSendEmailNotification(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScan = (result: any, error: any) => {
    if (!!result) {
      setId(result?.text);
      setShowScanner(false);
    }
    if (!!error) {
      console.info(error);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Package</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Number (ID)</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Scan or enter ID"
              className="flex-1 block w-full rounded-none rounded-l-md px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowScanner(!showScanner)}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500"
            >
              <QrCodeIcon className="h-5 w-5"/>
            </button>
          </div>
        </div>
        {showScanner && (
           <div className="bg-gray-900 p-2 rounded-lg">
             <QrReader
                onResult={handleScan}
                constraints={{ facingMode: 'environment' }}
                videoContainerStyle={{ width: '100%', paddingTop: '100%', position: 'relative' }}
                videoStyle={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
             />
             <button type="button" onClick={() => setShowScanner(false)} className="w-full mt-2 bg-red-500 text-white py-1 rounded-md">Close Scanner</button>
           </div>
        )}
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Surname</label>
          <select
            id="surname"
            value={surname}
            onChange={(e) => {
              if (e.target.value === '__ADD_NEW_USER__') {
                setShowAddUserModal(true);
                // Reset to first available surname or empty
                setSurname(surnames.length > 0 ? surnames[0] : '');
              } else {
                setSurname(e.target.value);
              }
            }}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            required
            disabled={surnames.length === 0 && !showAddUserModal}
          >
            <option value="__ADD_NEW_USER__" className="font-semibold text-indigo-600">➕ Add New User...</option>
            <option disabled>──────────</option>
            {surnames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            step="0.1"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            placeholder="e.g., 2.5"
          />
        </div>

        {/* Email Notification Section */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex items-center">
            <input
              id="sendEmailNotification"
              type="checkbox"
              checked={sendEmailNotification}
              onChange={(e) => setSendEmailNotification(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="sendEmailNotification" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Send email notification
            </label>
          </div>

          {selectedUser?.email && sendEmailNotification && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📧 Email will be sent to: <strong>{selectedUser.email}</strong>
              </p>
            </div>
          )}

          {!selectedUser?.email && sendEmailNotification && surname && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ No email address found for user: {surname}
              </p>
            </div>
          )}

          {sendEmailNotification && (
            <div className="mt-3">
              <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom notification message (optional)
              </label>
              <textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Add a personal message to include in the notification email..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty for default message
              </p>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Adding...' : 'Add Package'}
          {!isSubmitting && <PlusCircleIcon className="h-5 w-5"/>}
        </button>
      </form>
      
      <AddUserModal 
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={onAddUser}
      />
    </div>
  );
};
// To make QR Reader work from CDN:
(window as any).React = React;

export default PackageForm;

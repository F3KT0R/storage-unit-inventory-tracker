import React, { useState, useEffect, useRef } from 'react';
import { Package, User } from '../types';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { Html5Qrcode } from 'html5-qrcode';
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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);

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

  const startScanner = async () => {
    setShowScanner(true);

    // Wait for DOM to render
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 5, // Reduced FPS for more stable scanning
            qrbox: { width: 300, height: 150 }, // Wider box for barcodes
            aspectRatio: 2.0 // Better for horizontal barcodes
          },
          (decodedText) => {
            // Success callback - prevent multiple simultaneous scans
            if (isScanning.current) return;

            isScanning.current = true;
            console.log("Scanned:", decodedText);

            // Wait a bit to ensure we got the full barcode
            setTimeout(() => {
              setId(decodedText);
              stopScanner();
              isScanning.current = false;
            }, 100);
          },
          (errorMessage) => {
            // Error callback (continuous, ignore)
            console.debug(errorMessage);
          }
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setError("Failed to access camera. Please check permissions.");
        setShowScanner(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    isScanning.current = false;
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setShowScanner(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

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
              onClick={showScanner ? stopScanner : startScanner}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500"
            >
              <QrCodeIcon className="h-5 w-5"/>
            </button>
          </div>
        </div>
        {showScanner && (
           <div className="bg-gray-900 p-4 rounded-lg">
             <div className="text-white text-sm mb-2 text-center font-medium">
               📷 Point camera at QR Code or Barcode
             </div>
             <div className="text-white text-xs mb-3 text-center text-gray-400">
               For barcodes: hold phone horizontally for best results
             </div>
             <div id="qr-reader" style={{ width: '100%' }}></div>
             <button type="button" onClick={stopScanner} className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium">
               Close Scanner
             </button>
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

export default PackageForm;

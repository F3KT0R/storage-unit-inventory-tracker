export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum PackageStatus {
  IN_STORAGE = 'In Storage',
  DELIVERED = 'Delivered',
}

export interface Package {
  id: string; // QR or Barcode
  surname: string;
  weight: number; // in kg
  arrivalDate: string; // ISO 8601 format
  status: PackageStatus;
}

export interface User {
  id: number;
  name: string;
  email: string;
  status: string;
}

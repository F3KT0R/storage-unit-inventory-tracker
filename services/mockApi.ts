import { Package, PackageStatus, User } from '../types';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5234/api';

/**
 * A robust response handler that reads the body once and handles both JSON and text errors.
 * @param response The raw fetch response.
 * @returns The JSON data from the response.
 * @throws An error with a detailed message from the backend if the response is not ok.
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Handle "No Content" responses for successful PUT/DELETE requests.
  if (response.status === 204) {
    return null as T;
  }

  // If the response is successful (2xx status code), parse and return the JSON body.
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  // --- If we get here, the response is an error ---

  // Read the response body as text ONCE. This is crucial to avoid "body already read" errors.
  const errorText = await response.text();
  let errorMessage = errorText; // Default to the raw text content of the error.

  try {
    // Attempt to parse the text as JSON. If the server sent a structured JSON error, this will succeed.
    const errorJson = JSON.parse(errorText);
    // Use the more specific message from the JSON error if available.
    errorMessage = errorJson.message || errorJson.title || JSON.stringify(errorJson);
  } catch (e) {
    // If JSON.parse fails, it means the error was not in JSON format.
    // We do nothing here, because we've already stored the raw text in `errorMessage`.
  }

  // Fallback for empty error bodies
  if (!errorMessage) {
    errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
  }

  // Log the detailed error to the console for easier debugging
  console.error("An error occurred while fetching data from the API:", {
      url: response.url,
      status: response.status,
      message: errorMessage,
  });

  // Throw the final, most descriptive error message to be handled by the UI.
  throw new Error(errorMessage);
};


/**
 * A wrapper for all fetch calls to centralize error handling and logging.
 * @param url The endpoint URL to fetch from.
 * @param options The fetch request options (method, headers, body, etc.).
 * @returns The JSON data from the response.
 */
const apiCall = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    // This catch block handles network failures (e.g., server not running) or errors thrown from handleResponse.
    console.error(`API call to ${url} failed. Please ensure the backend is running and CORS is configured correctly.`, error);
    // Re-throw the error to be caught by the UI components (e.g., to show an error message).
    throw error;
  }
};


export const getPackages = (): Promise<Package[]> => {
  return apiCall<Package[]>('/packages');
};

export const getUsers = (): Promise<User[]> => {
  return apiCall<User[]>('/users');
};

export const addPackage = (
  newPackage: Omit<Package, 'arrivalDate' | 'status'>,
  emailOptions?: { sendNotification: boolean; notificationMessage?: string }
): Promise<Package> => {
  const body = {
    ...newPackage,
    emailNotification: emailOptions || { sendNotification: false }
  };

  return apiCall<Package>('/packages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const addUser = (
  name: string,
  email: string
): Promise<User> => {
  return apiCall<User>('/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email }),
  });
};

export const updatePackageStatus = (id: string, status: PackageStatus): Promise<void> => {
  return apiCall<void>(`/packages/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
};

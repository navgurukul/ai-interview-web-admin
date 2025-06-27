// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
  createdAt: string;
}

// Mock initial user data
let users: User[] = [
  {
    id: '1',
    name: 'Zhang San',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Li Si',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2023-03-20T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Wang Wu',
    email: 'wangwu@example.com',
    role: 'guest',
    status: 'inactive',
    createdAt: '2023-05-10T00:00:00.000Z',
  },
];

// Get all users
export function getUsers() {
  return [...users];
}

// Get a single user
export function getUserById(id: string) {
  return users.find(user => user.id === id);
}

// Create a user
export function createUser(userData: Omit<User, 'id' | 'createdAt'>) {
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

// Update a user
export function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    return users[index];
  }
  return null;
}

// Delete a user
export function deleteUser(id: string) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const deletedUser = users[index];
    users = users.filter(user => user.id !== id);
    return deletedUser;
  }
  return null;
}

// System settings type
export interface SystemSettings {
  siteName: string;
  logo: string;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
}

// Default system settings
let systemSettings: SystemSettings = {
  siteName: 'AI Interview System',
  logo: '/logo.png',
  theme: 'light',
  language: 'zh',
};

// Get system settings
export function getSystemSettings() {
  return { ...systemSettings };
}

// Update system settings
export function updateSystemSettings(settings: Partial<SystemSettings>) {
  systemSettings = { ...systemSettings, ...settings };
  return systemSettings;
}
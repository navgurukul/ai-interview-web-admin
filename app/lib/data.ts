// 用户类型定义
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
  createdAt: string;
}

// 模拟的初始用户数据
let users: User[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2023-03-20T00:00:00.000Z',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    role: 'guest',
    status: 'inactive',
    createdAt: '2023-05-10T00:00:00.000Z',
  },
];

// 获取所有用户
export function getUsers() {
  return [...users];
}

// 获取单个用户
export function getUserById(id: string) {
  return users.find(user => user.id === id);
}

// 创建用户
export function createUser(userData: Omit<User, 'id' | 'createdAt'>) {
  const newUser = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}

// 更新用户
export function updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    return users[index];
  }
  return null;
}

// 删除用户
export function deleteUser(id: string) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const deletedUser = users[index];
    users = users.filter(user => user.id !== id);
    return deletedUser;
  }
  return null;
}

// 系统设置类型
export interface SystemSettings {
  siteName: string;
  logo: string;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
}

// 默认系统设置
let systemSettings: SystemSettings = {
  siteName: 'AI Interview 系统',
  logo: '/logo.png',
  theme: 'light',
  language: 'zh',
};

// 获取系统设置
export function getSystemSettings() {
  return { ...systemSettings };
}

// 更新系统设置
export function updateSystemSettings(settings: Partial<SystemSettings>) {
  systemSettings = { ...systemSettings, ...settings };
  return systemSettings;
} 
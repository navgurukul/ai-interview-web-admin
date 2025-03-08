import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // 重定向到用户管理页面
  redirect('/dashboard/users');
} 
import { redirect } from 'next/navigation';

export default function Home() {
  // 重定向到后台管理页面
  redirect('/dashboard');
} 
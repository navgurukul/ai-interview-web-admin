import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to the user management page
  redirect('/dashboard/users');
}
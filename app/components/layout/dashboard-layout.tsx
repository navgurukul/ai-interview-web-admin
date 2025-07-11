'use client';

import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined, SettingOutlined, ProfileOutlined, QuestionCircleOutlined, FileTextOutlined, SolutionOutlined } from '@ant-design/icons'; // Added SolutionOutlined
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Content, Sider } = Layout;

// Define sidebar menu items
const menuItems = [
  {
    key: 'student-details', // New key for student details
    icon: <SolutionOutlined />, // New icon (example, can be changed)
    label: <Link href="/dashboard/student-details">Student Details</Link>, // Link to the new page
  },
  {
    key: 'users',
    icon: <UserOutlined />,
    label: <Link href="/dashboard/users">User Management</Link>,
  },
  {
    key: 'jobs',
    icon: <ProfileOutlined />,
    label: <Link href="/dashboard/jobs">Job Management</Link>,
  },
  {
    key: 'questions',
    icon: <QuestionCircleOutlined />,
    label: <Link href="/dashboard/questions">Question Management</Link>,
  },
  {
    key: 'tests',
    icon: <FileTextOutlined />,
    label: <Link href="/dashboard/tests">Test Management</Link>,
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: <Link href="/dashboard/settings">System Settings</Link>,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // Get the currently selected menu item
  const selectedKey = pathname.split('/')[2] || 'users';

  // Use Ant Design's theme
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: colorBgContainer }}>
        <div style={{ paddingLeft: 24, fontSize: 20, fontWeight: 'bold' }}>
          AI Interview Management System
        </div>
      </Header>
      <Layout>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          width={200}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
} 
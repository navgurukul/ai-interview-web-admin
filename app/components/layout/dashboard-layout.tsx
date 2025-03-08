'use client';

import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined, SettingOutlined, ProfileOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Content, Sider } = Layout;

// 定义侧边栏菜单项
const menuItems = [
  {
    key: 'users',
    icon: <UserOutlined />,
    label: <Link href="/dashboard/users">用户管理</Link>,
  },
  {
    key: 'jobs',
    icon: <ProfileOutlined />,
    label: <Link href="/dashboard/jobs">职位管理</Link>,
  },
  {
    key: 'questions',
    icon: <QuestionCircleOutlined />,
    label: <Link href="/dashboard/questions">题目管理</Link>,
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: <Link href="/dashboard/settings">系统设置</Link>,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
  // 获取当前选中的菜单项
  const selectedKey = pathname.split('/')[2] || 'users';

  // 使用Ant Design的主题
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: colorBgContainer }}>
        <div style={{ paddingLeft: 24, fontSize: 20, fontWeight: 'bold' }}>
          AI Interview 管理系统
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
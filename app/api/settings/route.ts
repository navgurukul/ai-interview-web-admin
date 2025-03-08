import { NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/app/lib/data';

// 获取系统设置
export async function GET() {
  try {
    const settings = getSystemSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: '获取系统设置失败' },
      { status: 500 }
    );
  }
}

// 更新系统设置
export async function PUT(request: Request) {
  try {
    const settingsData = await request.json();
    const updatedSettings = updateSystemSettings(settingsData);
    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    return NextResponse.json(
      { error: '更新系统设置失败' },
      { status: 400 }
    );
  }
} 
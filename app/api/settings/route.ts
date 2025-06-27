import { NextResponse } from 'next/server';
import { getSystemSettings, updateSystemSettings } from '@/app/lib/data';

// Get system settings
export async function GET() {
  try {
    const settings = getSystemSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve system settings' },
      { status: 500 }
    );
  }
}

// Update system settings
export async function PUT(request: Request) {
  try {
    const settingsData = await request.json();
    const updatedSettings = updateSystemSettings(settingsData);
    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 400 }
    );
  }
}
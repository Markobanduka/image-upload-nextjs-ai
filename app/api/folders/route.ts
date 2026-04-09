import { NextResponse } from 'next/server';
import { getAssetFolders } from '@/lib/assets';

export async function GET() {
    try {
        const folders = await getAssetFolders();
        return NextResponse.json({ folders });
    } catch (error) {
        console.error('Unable to list asset folders:', error);
        return NextResponse.json({ error: 'Unable to list folders' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { getAssetFolders, deleteAssetFolder } from '@/lib/assets';

export async function GET() {
    try {
        const folders = await getAssetFolders();
        return NextResponse.json({ folders });
    } catch (error) {
        console.error('Unable to list asset folders:', error);
        return NextResponse.json({ error: 'Unable to list folders' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { folderPath } = await request.json();
        if (!folderPath) {
            return NextResponse.json({ error: 'Folder path is required' }, { status: 400 });
        }
        
        await deleteAssetFolder(folderPath);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unable to delete folder:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete folder' }, { status: 500 });
    }
}

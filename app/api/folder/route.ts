import { NextRequest, NextResponse } from 'next/server';
import { deleteAssetFile, getFolderDetail, moveAssetFile, renameAssetFolder } from '@/lib/assets';

export async function GET(request: NextRequest) {
    const folderPath = request.nextUrl.searchParams.get('path') ?? '';
    if (!folderPath.trim()) {
        return NextResponse.json({ error: 'Folder path is required.' }, { status: 400 });
    }

    try {
        const folder = await getFolderDetail(folderPath);
        return NextResponse.json({ folder });
    } catch (error) {
        console.error('Folder fetch failed:', error);
        return NextResponse.json({ error: (error as Error).message || 'Unable to load folder.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const filePath = request.nextUrl.searchParams.get('filePath') ?? '';
    if (!filePath.trim()) {
        return NextResponse.json({ error: 'File path is required.' }, { status: 400 });
    }

    try {
        await deleteAssetFile(filePath);
        return NextResponse.json({ message: 'File deleted successfully.' });
    } catch (error) {
        console.error('File deletion failed:', error);
        return NextResponse.json({ error: (error as Error).message || 'Unable to delete file.' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const oldFilePath = body?.oldFilePath;
    const destinationFolder = body?.destinationFolder;

    if (!oldFilePath || !destinationFolder) {
        return NextResponse.json({ error: 'Old file path and destination folder are required.' }, { status: 400 });
    }

    try {
        await moveAssetFile(oldFilePath, destinationFolder);
        return NextResponse.json({ message: 'File moved successfully.' });
    } catch (error) {
        console.error('File move failed:', error);
        return NextResponse.json({ error: (error as Error).message || 'Unable to move file.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const oldFolderPath = body?.oldFolderPath;
    const newFolderName = body?.newFolderName;

    if (!oldFolderPath || !newFolderName) {
        return NextResponse.json({ error: 'Old folder path and new folder name are required.' }, { status: 400 });
    }

    try {
        const newPath = await renameAssetFolder(oldFolderPath, newFolderName);
        return NextResponse.json({ message: 'Folder renamed successfully.', newPath });
    } catch (error) {
        console.error('Folder rename failed:', error);
        return NextResponse.json({ error: (error as Error).message || 'Unable to rename folder.' }, { status: 500 });
    }
}

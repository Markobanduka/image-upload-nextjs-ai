import { NextResponse } from 'next/server';
import { getAssetFolders } from '@/lib/assets';

export async function GET() {
    try {
        const folders = await getAssetFolders();
        const allFiles: { name: string; url: string; folder: string }[] = [];

        const collectFiles = (folderList: typeof folders, currentPath = '') => {
            for (const folder of folderList) {
                const folderPath = currentPath ? `${currentPath}/${folder.name}` : folder.name;
                for (const file of folder.files) {
                    allFiles.push({
                        name: file.name,
                        url: file.url,
                        folder: folderPath,
                    });
                }
                if (folder.subfolders.length > 0) {
                    collectFiles(folder.subfolders, folderPath);
                }
            }
        };

        collectFiles(folders);

        return NextResponse.json({ files: allFiles });
    } catch (error) {
        console.error('Unable to list all files:', error);
        return NextResponse.json({ error: 'Unable to list files' }, { status: 500 });
    }
}
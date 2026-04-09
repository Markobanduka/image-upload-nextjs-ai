import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getUploadDirectory, sanitizeFolderName } from '@/lib/assets';

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const files = data.getAll('files') as File[];
    const folderValue = data.get('folder');
    const folder = typeof folderValue === 'string' ? folderValue : '';

    if (!folder.trim()) {
        return NextResponse.json({ error: 'Folder name is required.' }, { status: 400 });
    }

    let uploadDir;
    try {
        uploadDir = getUploadDirectory(folder);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }

    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles: string[] = [];

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        const relativePath = path.join(folder.trim(), filename).replace(/\\/g, '/');
        uploadedFiles.push(`/assets/${relativePath}`);
    }

    return NextResponse.json({ message: 'Files uploaded successfully', files: uploadedFiles });
}

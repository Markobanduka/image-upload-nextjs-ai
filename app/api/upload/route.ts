import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const files = data.getAll('files') as File[];
    const folder = data.get('folder') as string | null;

    let uploadDir = path.join(process.cwd(), 'public', 'assets');
    if (folder) {
        uploadDir = path.join(uploadDir, folder);
    }

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles = [];

    for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        const urlPath = folder ? `/assets/${folder}/${filename}` : `/assets/${filename}`;
        uploadedFiles.push(urlPath);
    }

    // Commit to git
    try {
        await execAsync('git add public/assets');
        await execAsync('git commit -m "Add uploaded images"');
    } catch (error) {
        console.error('Git commit failed:', error);
    }

    return NextResponse.json({ message: 'Files uploaded successfully', files: uploadedFiles });
}
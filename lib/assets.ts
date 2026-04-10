import path from 'path';
import { mkdir, readdir, stat, unlink, rename as fsRename } from 'fs/promises';
import { deleteFileFromGitHub } from './github';

export const assetRoot = path.join(process.cwd(), 'public', 'assets');

export function sanitizeFolderName(folder: string) {
    const cleaned = folder.trim().replace(/^\/+|\/+$/g, '');
    if (!cleaned) {
        throw new Error('Folder name is required.');
    }
    if (/\.\.|[^A-Za-z0-9 _./-]/.test(cleaned)) {
        throw new Error('Folder name may only contain letters, numbers, spaces, dashes, underscores, dots, and "/".');
    }
    return cleaned;
}

export function sanitizeAssetPath(assetPath: string) {
    const cleaned = assetPath.trim().replace(/^\/+|\/+$/g, '');
    if (!cleaned) {
        throw new Error('Path is required.');
    }
    if (/\.\.|[^A-Za-z0-9 _./-]/.test(cleaned)) {
        throw new Error('Path may only contain letters, numbers, spaces, dots, dashes, underscores, slashes, and file extensions.');
    }
    return cleaned;
}

export function getUploadDirectory(folder: string) {
    const sanitizedFolder = sanitizeFolderName(folder);
    return path.join(assetRoot, sanitizedFolder);
}

export async function ensureAssetFolder(folder: string) {
    const uploadDir = getUploadDirectory(folder);
    await mkdir(uploadDir, { recursive: true });
    return uploadDir;
}

export interface AssetFile {
    name: string;
    url: string;
}

export interface AssetFolder {
    name: string;
    path: string;
    fileCount: number;
    preview?: string;
    files: AssetFile[];
    subfolders: AssetFolder[];
}

function isAssetFile(filename: string) {
    return /\.(jpe?g|png|gif|webp|avif|svg|mp4|mov|avi)$/i.test(filename);
}

function isImageFile(filename: string) {
    return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(filename);
}

function buildUrl(relativePath: string) {
    return `/assets/${relativePath}`;
}

async function readFolder(folderPath: string, relativePath: string): Promise<AssetFolder> {
    const entries = await readdir(folderPath, { withFileTypes: true });
    const files: AssetFile[] = [];
    const subfolders: AssetFolder[] = [];

    for (const entry of entries) {
        const itemRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        const itemPath = path.join(folderPath, entry.name);

        if (entry.isDirectory()) {
            subfolders.push(await readFolder(itemPath, itemRelativePath));
            continue;
        }

        if (!isAssetFile(entry.name)) {
            continue;
        }

        files.push({
            name: entry.name,
            url: buildUrl(itemRelativePath),
        });
    }

    const preview = files.find((file) => isImageFile(file.name))?.url ?? subfolders.find((folder) => folder.preview)?.preview;
    const fileCount = files.length + subfolders.reduce((sum, child) => sum + child.fileCount, 0);

    return {
        name: path.basename(relativePath) || path.basename(folderPath),
        path: relativePath,
        fileCount,
        preview,
        files,
        subfolders,
    };
}

export async function getAssetFolders() {
    try {
        await stat(assetRoot);
    } catch {
        return [];
    }

    const entries = await readdir(assetRoot, { withFileTypes: true });
    const folders: AssetFolder[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        const relativePath = entry.name;
        folders.push(await readFolder(path.join(assetRoot, entry.name), relativePath));
    }

    return folders;
}

export async function getFolderDetail(relativePath: string): Promise<AssetFolder> {
    const cleanedPath = sanitizeFolderName(relativePath);
    const fullPath = path.join(assetRoot, cleanedPath);
    const stats = await stat(fullPath);
    if (!stats.isDirectory()) {
        throw new Error('Folder does not exist.');
    }
    return await readFolder(fullPath, cleanedPath);
}

export async function deleteAssetFile(relativeFilePath: string) {
    const cleanedPath = sanitizeAssetPath(relativeFilePath);
    const fullPath = path.join(assetRoot, cleanedPath);
    await unlink(fullPath);

    // Also delete from GitHub
    try {
        await deleteFileFromGitHub(cleanedPath);
    } catch (githubError) {
        console.warn('Failed to delete from GitHub:', githubError);
        // Don't throw error for GitHub failure, as local delete succeeded
    }
}

export async function renameAssetFolder(oldRelativePath: string, newFolderName: string) {
    const cleanedOldPath = sanitizeFolderName(oldRelativePath);
    const cleanedNewName = sanitizeFolderName(newFolderName);
    const parentFolder = path.dirname(cleanedOldPath);
    const newRelativePath = parentFolder === '.' ? cleanedNewName : `${parentFolder}/${cleanedNewName}`;
    const oldFullPath = path.join(assetRoot, cleanedOldPath);
    const newFullPath = path.join(assetRoot, newRelativePath);
    await fsRename(oldFullPath, newFullPath);
    return newRelativePath;
}

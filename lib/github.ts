import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const OWNER = process.env.GITHUB_OWNER || 'Markobanduka';
const REPO = process.env.GITHUB_REPO || 'image-upload-nextjs-ai';

export async function deleteFileFromGitHub(filePath: string) {
    try {
        // Get the file content first to get the SHA
        const { data: fileData } = await octokit.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: `public/assets/${filePath}`,
        });

        if (Array.isArray(fileData)) {
            throw new Error('Path is a directory, not a file');
        }

        // Delete the file
        await octokit.repos.deleteFile({
            owner: OWNER,
            repo: REPO,
            path: `public/assets/${filePath}`,
            message: `Delete file: ${filePath}`,
            sha: fileData.sha,
        });

        return true;
    } catch (error) {
        console.error('GitHub delete error:', error);
        throw new Error('Failed to delete file from GitHub');
    }
}

export async function uploadFileToGitHub(filePath: string, content: Buffer) {
    try {
        const base64Content = content.toString('base64');

        // Check if file exists
        let sha: string | undefined;
        try {
            const { data: existingFile } = await octokit.repos.getContent({
                owner: OWNER,
                repo: REPO,
                path: `public/assets/${filePath}`,
            });
            if (!Array.isArray(existingFile)) {
                sha = existingFile.sha;
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            // File doesn't exist, that's fine
        }

        await octokit.repos.createOrUpdateFileContents({
            owner: OWNER,
            repo: REPO,
            path: `public/assets/${filePath}`,
            message: `Add file: ${filePath}`,
            content: base64Content,
            sha,
        });

        return true;
    } catch (error) {
        console.error('GitHub upload error:', error);
        throw new Error('Failed to upload file to GitHub');
    }
}

export async function deleteFolderFromGitHub(folderPath: string) {
    try {
        // Get all files in the folder recursively
        const { data: contents } = await octokit.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: `public/assets/${folderPath}`,
        });

        if (!Array.isArray(contents)) {
            throw new Error('Path is not a directory');
        }

        // Delete all files in the folder
        for (const item of contents) {
            if (item.type === 'file') {
                await octokit.repos.deleteFile({
                    owner: OWNER,
                    repo: REPO,
                    path: item.path,
                    message: `Delete file: ${item.path}`,
                    sha: item.sha,
                });
            } else if (item.type === 'dir') {
                // Recursively delete subfolders
                await deleteFolderFromGitHub(item.path.replace('public/assets/', ''));
            }
        }

        return true;
    } catch (error) {
        console.error('GitHub folder delete error:', error);
        throw new Error('Failed to delete folder from GitHub');
    }
}
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import UploadPanel from './UploadPanel';

interface AssetFile {
    name: string;
    url: string;
}

interface AssetFolder {
    name: string;
    path: string;
    fileCount: number;
    preview?: string;
    files: AssetFile[];
    subfolders: AssetFolder[];
}

interface FolderDetailProps {
    folderPath: string;
}

export default function FolderDetail({ folderPath }: FolderDetailProps) {
    const [folder, setFolder] = useState<AssetFolder | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [showUploadPanel, setShowUploadPanel] = useState(false);
    const router = useRouter();

    const loadFolder = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/folder?path=${encodeURIComponent(folderPath)}`);
            const result = await response.json();
            if (response.ok) {
                setFolder(result.folder);
            } else {
                setError(result.error || 'Unable to load folder.');
            }
        } catch (fetchError) {
            setError('Unable to load folder.');
            console.error(fetchError);
        } finally {
            setIsLoading(false);
        }
    }, [folderPath]);

    useEffect(() => {
        loadFolder();
    }, [loadFolder]);

    const deleteFile = async (fileName: string) => {
        setError('');
        setMessage('');

        try {
            const filePath = `${folderPath}/${fileName}`;
            const response = await fetch(`/api/folder?filePath=${encodeURIComponent(filePath)}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                setMessage(result.message || 'File deleted.');
                await loadFolder();
            } else {
                setError(result.error || 'Unable to delete file.');
            }
        } catch (deleteError) {
            setError('Unable to delete file.');
            console.error(deleteError);
        }
    };

    const renameFolder = async () => {
        if (!newFolderName.trim()) {
            setError('New folder name is required.');
            return;
        }

        setError('');
        setMessage('');

        try {
            const response = await fetch('/api/folder', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldFolderPath: folderPath,
                    newFolderName: newFolderName.trim(),
                }),
            });
            const result = await response.json();
            if (response.ok) {
                const newPath = result.newPath as string;
                setMessage(result.message || 'Folder renamed.');
                router.push(encodeURI(`/folder/${newPath}`));
            } else {
                setError(result.error || 'Unable to rename folder.');
            }
        } catch (renameError) {
            setError('Unable to rename folder.');
            console.error(renameError);
        }
    };

    const handleFolderUploadComplete = async () => {
        await loadFolder();
        setMessage('Files uploaded to this folder.');
    };

    const parentPath = folderPath.split('/').slice(0, -1).join('/');

    return (
        <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <p style={{ margin: 0, color: '#555' }}>
                        Path:{' '}
                        {folderPath.split('/').map((segment, index) => {
                            const isLast = index === folderPath.split('/').length - 1;
                            const segmentPath = folderPath.split('/').slice(0, index + 1).join('/');
                            return (
                                <span key={segmentPath}>
                                    {!isLast ? (
                                        <Link href={encodeURI(`/folder/${segmentPath}`)} style={{ color: '#0070f3', textDecoration: 'underline' }}>
                                            {segment}
                                        </Link>
                                    ) : (
                                        <strong>{segment}</strong>
                                    )}
                                    {!isLast && ' / '}
                                </span>
                            );
                        })}
                    </p>
                </div>
                <div>
                    {parentPath && (
                        <Link href={encodeURI(`/folder/${parentPath}`)} style={{ color: '#0070f3', textDecoration: 'underline' }}>
                            Back to parent folder
                        </Link>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href="/" style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #888', background: '#fff', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                    Back to home
                </Link>
                <button type="button" onClick={() => setShowUploadPanel((prev) => !prev)} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #888', background: '#fff', cursor: 'pointer' }}>
                    {showUploadPanel ? 'Hide uploader' : 'Add files to this folder'}
                </button>
                <button type="button" onClick={loadFolder} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #888', background: '#fff', cursor: 'pointer' }}>
                    Refresh
                </button>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                        value={newFolderName}
                        onChange={(event) => setNewFolderName(event.target.value)}
                        placeholder="New folder name"
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', minWidth: '220px' }}
                    />
                    <button type="button" onClick={renameFolder} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
                        Rename folder
                    </button>
                </div>
            </div>

            {showUploadPanel && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.75rem', background: '#fafafa' }}>
                    <h3 style={{ marginTop: 0 }}>Upload to {folderPath}</h3>
                    <UploadPanel defaultFolder={folderPath} hideFolderField onUploadComplete={handleFolderUploadComplete} />
                </div>
            )}

            {message && <p style={{ color: '#0a0' }}>{message}</p>}
            {error && <p style={{ color: '#d00' }}>{error}</p>}
            {isLoading && <p>Loading folder content...</p>}

            {folder && (
                <div>
                    <h2>{folder.name}</h2>
                    <p style={{ color: '#555' }}>{folder.fileCount} item(s)</p>

                    {folder.subfolders.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3>Subfolders</h3>
                            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                                {folder.subfolders.map((subfolder) => (
                                    <Link key={subfolder.path} href={encodeURI(`/folder/${subfolder.path}`)} style={{ display: 'block', padding: '1rem', border: '1px solid #ddd', borderRadius: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                                        <strong>{subfolder.name}</strong>
                                        <p style={{ margin: '0.5rem 0 0', color: '#555' }}>{subfolder.fileCount} item(s)</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3>Files</h3>
                        {folder.files.length === 0 ? (
                            <p>No files in this folder.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                                {folder.files.map((file) => (
                                    <div key={file.url} style={{ border: '1px solid #ddd', borderRadius: '0.75rem', padding: '1rem' }}>
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            {file.url.match(/\.(jpe?g|png|gif|webp|avif|svg)$/i) ? (
                                                <Image src={file.url} alt={file.name} width={280} height={180} style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ padding: '2rem', background: '#f7f7f7', borderRadius: '0.5rem' }}>
                                                    <p style={{ margin: 0 }}>No preview available</p>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{file.name}</span>
                                            <button type="button" onClick={() => deleteFile(file.name)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: '#d00', color: '#fff', cursor: 'pointer' }}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

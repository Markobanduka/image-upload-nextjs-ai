'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FolderFile {
    name: string;
    url: string;
}

interface FolderSummary {
    name: string;
    path: string;
    fileCount: number;
    preview?: string;
    files: FolderFile[];
    subfolders: FolderSummary[];
}

interface FolderOverviewProps {
    refreshKey?: number;
}

export default function FolderOverview({ refreshKey = 0 }: FolderOverviewProps) {
    const [folders, setFolders] = useState<FolderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const loadFolders = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/folders');
            const result = await response.json();
            if (response.ok) {
                setFolders(result.folders || []);
            } else {
                setError(result.error || 'Could not load folders.');
            }
        } catch (fetchError) {
            setError('Could not load folders.');
            console.error(fetchError);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFolders();
    }, [refreshKey]);

    const deleteFolder = async (folderPath: string) => {
        if (!confirm(`Are you sure you want to delete the folder "${folderPath}" and all its contents? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch('/api/folders', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folderPath }),
            });

            if (response.ok) {
                loadFolders(); // Refresh the list
            } else {
                const result = await response.json();
                alert(`Failed to delete folder: ${result.error}`);
            }
        } catch (error) {
            console.error('Delete folder error:', error);
            alert('Failed to delete folder');
        }
    };

    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Folders</h2>
                </div>
                <button type="button" onClick={loadFolders} style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: '1px solid #888', background: '#fff', cursor: 'pointer' }}>
                    Refresh
                </button>
            </div>
            {isLoading && <p>Loading folders...</p>}
            {error && <p style={{ color: '#d00' }}>{error}</p>}
            {!isLoading && folders.length === 0 && <p>No folders created yet.</p>}
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {folders.map((folder) => (
                    <div key={folder.path} style={{ border: '1px solid #ddd', borderRadius: '0.75rem', padding: '1rem', position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => deleteFolder(folder.path)}
                            style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                zIndex: 1
                            }}
                            title="Delete folder"
                        >
                            ✕
                        </button>
                        <Link href={encodeURI(`/folder/${folder.path}`)} style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {folder.preview ? (
                                    <Image src={folder.preview} alt={folder.name} width={80} height={80} style={{ borderRadius: '0.5rem', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: 80, height: 80, borderRadius: '0.5rem', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                        No preview
                                    </div>
                                )}
                                <div>
                                    <h3 style={{ margin: 0 }}>{folder.name}</h3>
                                    <p style={{ margin: 0, color: '#555' }}>{folder.fileCount} item(s)</p>
                                </div>
                            </div>
                        </Link>
                        {folder.subfolders.length > 0 && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f9f9f9', borderRadius: '0.5rem' }}>
                                <strong>Subfolders</strong>
                                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1rem' }}>
                                    {folder.subfolders.map((subfolder) => (
                                        <li key={subfolder.path}>{subfolder.name} ({subfolder.fileCount})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}

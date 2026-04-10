'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import UploadPanel from './UploadPanel';

interface AssetFile {
    name: string;
    url: string;
    folder: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AllImagesViewProps {}

export default function AllImagesView({}: AllImagesViewProps) {
    const [allFiles, setAllFiles] = useState<AssetFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadAllFiles = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/all-files');
            const result = await response.json();
            if (response.ok) {
                setAllFiles(result.files || []);
            } else {
                setError(result.error || 'Unable to load files.');
            }
        } catch (fetchError) {
            setError('Unable to load files.');
            console.error(fetchError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllFiles();
    }, [loadAllFiles]);

    const deleteFile = async (filePath: string) => {
        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/folder?filePath=${encodeURIComponent(filePath)}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                setMessage(result.message || 'File deleted.');
                await loadAllFiles();
            } else {
                setError(result.error || 'Unable to delete file.');
            }
        } catch (deleteError) {
            setError('Unable to delete file.');
            console.error(deleteError);
        }
    };

    return (
        <section>
            <div style={{ marginBottom: '2rem' }}>
                <UploadPanel onUploadComplete={loadAllFiles} />
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h2>All Files ({allFiles.length})</h2>
                </div>
                <button type="button" onClick={loadAllFiles} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #888', background: '#fff', cursor: 'pointer' }}>
                    Refresh
                </button>
            </div>

            {message && <p style={{ color: '#0a0' }}>{message}</p>}
            {error && <p style={{ color: '#d00' }}>{error}</p>}
            {isLoading && <p>Loading files...</p>}

            {allFiles.length === 0 && !isLoading ? (
                <p>No files uploaded yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {allFiles.map((file) => (
                        <div key={file.url} style={{ border: '1px solid #ddd', borderRadius: '0.75rem', padding: '1rem' }}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                {file.url.match(/\.(jpe?g|png|gif|webp|avif|svg)$/i) ? (
                                    <Image src={file.url} alt={file.name} width={280} height={180} style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                ) : file.url.match(/\.(mp4|mov|avi)$/i) ? (
                                    <video width="280" height="180" controls style={{ width: '100%', height: 'auto', borderRadius: '0.5rem' }}>
                                        <source src={file.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div style={{ padding: '2rem', background: '#f7f7f7', borderRadius: '0.5rem' }}>
                                        <p style={{ margin: 0 }}>No preview available</p>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{file.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#555', fontSize: '0.9rem' }}>Folder: {file.folder}</span>
                                <button type="button" onClick={() => deleteFile(`${file.folder}/${file.name}`)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: '#d00', color: '#fff', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
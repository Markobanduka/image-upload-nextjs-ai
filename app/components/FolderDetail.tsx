'use client';

import { type TouchEvent, useCallback, useEffect, useRef, useState } from 'react';
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
    const [moveFileName, setMoveFileName] = useState<string | null>(null);
    const [destinationFolders, setDestinationFolders] = useState<string[]>([]);
    const [isMoving, setIsMoving] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);
    const [isMediaLoading, setIsMediaLoading] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const router = useRouter();

    const isImageFile = (url: string) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(url);
    const isVideoFile = (url: string) => /\.(mp4|mov|avi|webm|m4v)$/i.test(url);

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

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
        }
    }, [volume]);

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

    const flattenFolderPaths = useCallback((folders: AssetFolder[], currentPath = ''): string[] => {
        let paths: string[] = [];
        for (const folderItem of folders) {
            const folderPathValue = currentPath ? `${currentPath}/${folderItem.name}` : folderItem.name;
            paths.push(folderPathValue);
            paths = paths.concat(flattenFolderPaths(folderItem.subfolders, folderPathValue));
        }
        return paths;
    }, []);

    const loadDestinationFolders = async () => {
        if (destinationFolders.length > 0) {
            return;
        }

        try {
            setIsMoving(true);
            setError('');
            const response = await fetch('/api/folders');
            const result = await response.json();
            if (response.ok) {
                const paths = flattenFolderPaths(result.folders || []);
                setDestinationFolders(paths.filter((path) => path !== folderPath));
            } else {
                setError(result.error || 'Unable to load folders.');
            }
        } catch (fetchError) {
            setError('Unable to load folders.');
            console.error(fetchError);
        } finally {
            setIsMoving(false);
        }
    };

    const openMoveMenu = async (fileName: string) => {
        setMoveFileName(fileName);
        await loadDestinationFolders();
    };

    const closeMoveMenu = () => {
        setMoveFileName(null);
    };

    const moveFileToFolder = async (destinationFolder: string) => {
        if (!moveFileName) return;

        setError('');
        setMessage('');
        setIsMoving(true);

        try {
            const response = await fetch('/api/folder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldFilePath: `${folderPath}/${moveFileName}`,
                    destinationFolder,
                }),
            });
            const result = await response.json();
            if (response.ok) {
                setMessage(result.message || `Moved ${moveFileName} to ${destinationFolder}.`);
                setMoveFileName(null);
                setDestinationFolders([]);
                await loadFolder();
            } else {
                setError(result.error || 'Unable to move file.');
            }
        } catch (moveError) {
            setError('Unable to move file.');
            console.error(moveError);
        } finally {
            setIsMoving(false);
        }
    };

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        setVideoPlaying(false);
        setIsMediaLoading(true);
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
        setTouchStartX(null);
        setTouchEndX(null);
    }, []);

    const showNextImage = useCallback(() => {
        if (!folder) return;
        setVideoPlaying(false);
        setIsMediaLoading(true);
        setLightboxIndex((current) => {
            if (current === null) return null;
            return (current + 1) % folder.files.length;
        });
    }, [folder]);

    const showPrevImage = useCallback(() => {
        if (!folder) return;
        setVideoPlaying(false);
        setIsMediaLoading(true);
        setLightboxIndex((current) => {
            if (current === null) return null;
            return (current - 1 + folder.files.length) % folder.files.length;
        });
    }, [folder]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (lightboxIndex === null) return;
        if (event.key === 'Escape') {
            closeLightbox();
        }
        if (event.key === 'ArrowRight') {
            showNextImage();
        }
        if (event.key === 'ArrowLeft') {
            showPrevImage();
        }
    }, [lightboxIndex, closeLightbox, showNextImage, showPrevImage]);

    useEffect(() => {
        if (lightboxIndex !== null) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [lightboxIndex, handleKeyDown]);

    const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
        setTouchStartX(event.touches[0]?.clientX ?? null);
    };

    const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
        setTouchEndX(event.touches[0]?.clientX ?? null);
    };

    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) return;
        const distance = touchStartX - touchEndX;
        if (Math.abs(distance) > 50) {
            if (distance > 0) {
                showNextImage();
            } else {
                showPrevImage();
            }
        }
        setTouchStartX(null);
        setTouchEndX(null);
    };

    const parentPath = folderPath.split('/').slice(0, -1).join('/');
    const currentLightboxFile = folder && lightboxIndex !== null ? folder.files[lightboxIndex] : null;

    return (
        <section>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
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
                                {folder.files.map((file, index) => (
                                    <div key={file.url} style={{ border: '1px solid #ddd', borderRadius: '0.75rem', padding: '1rem' }}>
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            {isImageFile(file.url) ? (
                                                <div
                                                    style={{ cursor: 'pointer', position: 'relative', width: '100%', height: '200px', borderRadius: '0.5rem', overflow: 'hidden', background: '#f0f0f0' }}
                                                    onClick={() => openLightbox(index)}
                                                >
                                                    <Image src={file.url} alt={file.name} fill style={{ objectFit: 'cover' }} />
                                                </div>
                                            ) : isVideoFile(file.url) ? (
                                                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                                                    <video
                                                        controls
                                                        muted
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    >
                                                        <source src={file.url} type="video/mp4" />
                                                        Your browser does not support the video tag.
                                                    </video>
                                                    <button
                                                        type="button"
                                                        onClick={() => openLightbox(index)}
                                                        style={{
                                                            position: 'absolute',
                                                            bottom: '0.75rem',
                                                            right: '0.75rem',
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '0.5rem',
                                                            border: 'none',
                                                            background: 'rgba(0,0,0,0.7)',
                                                            color: '#fff',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ width: '100%', height: '200px', padding: '2rem', background: '#f7f7f7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <p style={{ margin: 0 }}>No preview</p>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button type="button" onClick={() => openMoveMenu(file.name)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #0070f3', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
                                                    Move
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm(`Delete ${file.name}? Are you sure?`)) {
                                                            deleteFile(file.name);
                                                        }
                                                    }}
                                                    style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: '#d00', color: '#fff', cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        {moveFileName === file.name && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#eef4ff', borderRadius: '0.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <strong>Select destination folder</strong>
                                                    <button type="button" onClick={closeMoveMenu} style={{ padding: '0.35rem 0.6rem', borderRadius: '0.5rem', border: '1px solid #888', background: '#fff', cursor: 'pointer' }}>
                                                        Cancel
                                                    </button>
                                                </div>
                                                {destinationFolders.length === 0 ? (
                                                    <p style={{ margin: 0, color: '#555' }}>{isMoving ? 'Loading folders...' : 'No other folders available.'}</p>
                                                ) : (
                                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                        {destinationFolders.map((destinationFolder) => (
                                                            <button
                                                                key={destinationFolder}
                                                                type="button"
                                                                onClick={() => moveFileToFolder(destinationFolder)}
                                                                style={{ textAlign: 'left', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #0070f3', background: '#fff', color: '#0070f3', cursor: 'pointer' }}
                                                            >
                                                                {destinationFolder}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {currentLightboxFile && (
                <div
                    onClick={closeLightbox}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                >
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            closeLightbox();
                        }}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#fff',
                            color: '#000',
                            cursor: 'pointer',
                            zIndex: 1001,
                        }}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            showPrevImage();
                        }}
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#fff',
                            color: '#000',
                            cursor: 'pointer',
                            zIndex: 1001,
                        }}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            showNextImage();
                        }}
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#fff',
                            color: '#000',
                            cursor: 'pointer',
                            zIndex: 1001,
                        }}
                    >
                        ›
                    </button>
                    <div style={{ maxWidth: '100%', maxHeight: '100%', width: '100%', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '100%', height: '80vh', margin: '0 auto' }}>
                            {isVideoFile(currentLightboxFile.url) ? (
                                <video
                                    ref={videoRef}
                                    src={currentLightboxFile.url}
                                    controls
                                    autoPlay
                                    onLoadedData={() => setIsMediaLoading(false)}
                                    onPlay={() => setVideoPlaying(true)}
                                    onPause={() => setVideoPlaying(false)}
                                    style={{ width: '100%', height: '100%', borderRadius: '0.5rem', background: '#000', objectFit: 'contain' }}
                                    onClick={(event) => event.stopPropagation()}
                                />
                            ) : (
                                <Image
                                    src={currentLightboxFile.url}
                                    alt={currentLightboxFile.name}
                                    fill
                                    style={{ objectFit: 'contain', borderRadius: '0.5rem' }}
                                    onClick={(event) => event.stopPropagation()}
                                    onLoad={() => setIsMediaLoading(false)}
                                    onError={() => setIsMediaLoading(false)}
                                />
                            )}
                            {isMediaLoading && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.7)',
                                        borderRadius: '0.5rem',
                                        zIndex: 1002,
                                    }}
                                >
                                    <div style={{ textAlign: 'center', color: '#fff' }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                border: '4px solid #f3f3f3',
                                                borderTop: '4px solid #0070f3',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite',
                                                margin: '0 auto 1rem',
                                            }}
                                        ></div>
                                        <p>Loading...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {isVideoFile(currentLightboxFile.url) && (
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!videoRef.current) return;
                                        if (videoPlaying) {
                                            videoRef.current.pause();
                                        } else {
                                            videoRef.current.play();
                                        }
                                    }}
                                    style={{ padding: '0.6rem 1rem', borderRadius: '0.5rem', border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}
                                >
                                    {videoPlaying ? 'Pause' : 'Play'}
                                </button>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                    Volume
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={volume}
                                        onChange={(event) => {
                                            const value = Number(event.target.value);
                                            setVolume(value);
                                            if (videoRef.current) {
                                                videoRef.current.volume = value;
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        )}
                        <p style={{ color: '#fff', marginTop: '1rem' }}>{currentLightboxFile.name}</p>
                    </div>
                </div>
            )}
        </section>
    );
}

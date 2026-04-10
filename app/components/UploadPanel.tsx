'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadPanelProps {
    onUploadComplete?: () => void;
    defaultFolder?: string;
    hideFolderField?: boolean;
}

const validateFolderName = (folder: string) => {
    return /^[A-Za-z0-9 _./-]+$/.test(folder.trim());
};

export default function UploadPanel({ onUploadComplete, defaultFolder, hideFolderField = false }: UploadPanelProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [folder, setFolder] = useState(defaultFolder ?? '');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const onDrop = (acceptedFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
        setStatus('');
        setError('');
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [], 'video/*': [] } });

    const saveImages = async () => {
        if (!folder.trim()) {
            setError('Folder name is required.');
            return;
        }

        if (!validateFolderName(folder)) {
            setError('Folder name may contain letters, numbers, dashes, underscores and nested folders using /.');
            return;
        }

        if (files.length === 0) {
            setError('Select at least one file before saving.');
            return;
        }

        setError('');
        setStatus('Uploading...');

        const formData = new FormData();
        formData.append('folder', folder.trim());
        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                setStatus(`Saved ${files.length} file(s) to ${folder.trim()}.`);
                setFiles([]);
                onUploadComplete?.();
            } else {
                setError(result.error || 'Upload failed.');
                setStatus('');
            }
        } catch (uploadError) {
            setError('Upload failed.');
            setStatus('');
            console.error(uploadError);
        }
    };

    return (
        <section style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="folder" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Folder name
                </label>
                {hideFolderField && defaultFolder ? (
                    <div style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', background: '#f7f7f7' }}>
                        {defaultFolder}
                    </div>
                ) : (
                    <input
                        id="folder"
                        value={folder}
                        onChange={(event) => setFolder(event.target.value)}
                        placeholder="Example: windsurf/2026"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                        readOnly={!!defaultFolder}
                    />
                )}
            </div>
            <div
                {...getRootProps()}
                style={{ border: '2px dashed #888', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
            >
                <input {...getInputProps()} />
                <p>Drag & drop images or videos here, or click to select files.</p>
                <strong>{files.length} file(s) ready</strong>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={saveImages} style={{ padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}>
                    Save Images
                </button>
                {status && <span style={{ color: '#0a0' }}>{status}</span>}
                {error && <span style={{ color: '#d00' }}>{error}</span>}
            </div>
            {files.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                    <h3>Selected files</h3>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {files.map((file) => (
                            <li key={`${file.name}-${file.size}`} style={{ marginBottom: '0.5rem' }}>
                                {file.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

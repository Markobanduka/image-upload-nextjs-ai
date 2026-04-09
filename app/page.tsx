"use client";

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

const Page = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [folder, setFolder] = useState('');

    const onDrop = (acceptedFiles: File[]) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const saveImages = async () => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        if (folder) {
            formData.append('folder', folder);
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                setUploadedImages((prev) => [...prev, ...result.files]);
                setFiles([]);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Upload failed');
        }
    };

    return (
        <div>
            <h1>Image Upload</h1>
            <input type="text" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Folder name (optional)" />
            <div {...getRootProps()} style={{ border: '2px dashed #cccccc', padding: '20px', textAlign: 'center' }}>
                <input {...getInputProps()} />
                <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
            </div>
            <button onClick={saveImages}>Save Images</button>
            <div>
                <h2>Selected Files:</h2>
                {files.map((file, index) => (
                    <div key={index}>{file.name}</div>
                ))}
            </div>
            <div>
                <h2>Uploaded Images:</h2>
                {uploadedImages.map((url, index) => (
                    <Image key={index} src={url} alt={`Uploaded ${index}`} width={200} height={200} style={{ margin: '10px' }} />
                ))}
            </div>
        </div>
    );
};

export default Page;

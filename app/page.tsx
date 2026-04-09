import AssetManager from './components/AssetManager';

export default function Page() {
    return (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1>Image and Folder Manager</h1>
                <p>Upload images and videos into named folders, then browse folders from the homepage.</p>
            </header>
            <AssetManager />
        </main>
    );
}


import FolderDetail from '../../components/FolderDetail';

interface FolderPageProps {
    params: {
        folder: string[];
    };
}

export default function FolderPage({ params }: FolderPageProps) {
    const folderPath = (params?.folder ?? []).join('/');

    if (!folderPath) {
        return (
            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
                <p>Invalid folder path.</p>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1>Folder: {folderPath}</h1>
            </header>
            <FolderDetail folderPath={folderPath} />
        </main>
    );
}

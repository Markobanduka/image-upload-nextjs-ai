import FolderDetail from '../../components/FolderDetail';
import AllImagesView from '../../components/AllImagesView';

interface FolderPageProps {
    params: {
        folder: string[];
    };
}

export default async function FolderPage({ params }: FolderPageProps) {
    const resolvedParams = await params;
    const folderPath = (resolvedParams?.folder ?? []).join('/');

    if (!folderPath) {
        // Show all images when no folder path is provided
        return (
            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h1>All Images</h1>
                    <p>View all uploaded images and videos across all folders.</p>
                </header>
                <AllImagesView />
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

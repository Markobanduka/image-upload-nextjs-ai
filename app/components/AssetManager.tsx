'use client';

import { useState } from 'react';
import UploadPanel from './UploadPanel';
import FolderOverview from './FolderOverview';

export default function AssetManager() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div>
            <UploadPanel onUploadComplete={() => setRefreshKey((value) => value + 1)} />
            <FolderOverview refreshKey={refreshKey} />
        </div>
    );
}

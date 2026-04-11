# Windsurf

## Image and Video Storage

This document will serve as a record for all images and videos uploaded to the repository. Images and videos are stored in the `/public/assets` folder, organized into subfolders as necessary.

## Current Implementation

- Homepage uses a reusable component structure.
- Upload logic is split into dedicated components under `app/components`.
- Uploads are handled by `app/api/upload/route.ts`.
- Folder listing is provided by `app/api/folders/route.ts`.
- Folder details and file management via `app/api/folder/route.ts`.
- All files listing via `app/api/all-files/route.ts`.
- Folder and asset helper functions live in `lib/assets.ts`.
- GitHub integration functions in `lib/github.ts`.
- Uploaded files are saved in `public/assets/<folder>`.
- Files are automatically synced to GitHub repository.
- The homepage displays all folders with preview images and item counts.
- Individual folders can be viewed and managed at `/folder/{folderPath}`.
- Supports `.m4v` video files as well as standard image formats.

## Components

- `app/components/UploadPanel.tsx`
  - Drag-and-drop file upload.
  - Requires a folder name before upload.
  - Supports images and videos.
  - Displays upload status and error messages.

- `app/components/FolderOverview.tsx`
  - Displays all asset folders as clickable cards.
  - Shows folder preview image, file count.
  - Links to individual folder detail page.
  - Refresh button to reload folder list.

- `app/components/FolderDetail.tsx`
  - Displays folder contents (files and subfolders).
  - Shows file thumbnails for images.
  - Delete individual files with a button.
  - Move files to another folder using a blue Move button.
  - Rename folder with input and confirm button.
  - Navigate back to parent folder.
  - Navigate back to the home page with a dedicated button.
  - Add pictures and videos directly to the current folder.
  - Breadcrumb navigation for folder hierarchy.
- Full-screen video viewer includes play/pause and adjustable volume.
  - Includes upload functionality directly on the page.
  - Shows file previews, folder information, and delete buttons.
  - Supports both images and videos with appropriate previews.

## API Routes

- `POST /api/upload` - Upload files to a specified folder (syncs to GitHub)
- `GET /api/folders` - List all folders with metadata
- `GET /api/folder?path={folderPath}` - Get details of a specific folder
- `GET /api/all-files` - Get all files across all folders
- `DELETE /api/folder?filePath={filePath}` - Delete a file from folder and GitHub
- `PATCH /api/folder` - Rename a folder

## Pages

- `/` - Homepage with upload panel and folder overview
- `/folder` - All images view showing files from all folders
- `/folder/{folderPath}` - Folder detail page with file management, plus home navigation and direct upload to that folder

## Features

- Drag-and-drop and click-to-select file uploads
- Organize files into named folders and subfolders
- View all folders with previews
- View all images/videos across all folders at `/folder`
- Click folders to open `/folder/{name}` detail view
- Delete individual images/videos from folders (removes from local and GitHub)
- Rename folders
- Navigate folder hierarchy with breadcrumbs
- GitHub integration for version control of assets
- Automatic sync of uploads and deletions to GitHub repository
- All files stored in repository at `/public/assets`

## Library Functions

`lib/assets.ts` exports:

- `sanitizeFolderName()` - Validate folder names
- `sanitizeAssetPath()` - Validate file paths
- `getUploadDirectory()` - Get full path for folder
- `ensureAssetFolder()` - Create folder if needed
- `getAssetFolders()` - List all folders recursively
- `getFolderDetail()` - Get folder contents
- `deleteAssetFile()` - Delete a file
- `renameAssetFolder()` - Rename a folder

`lib/github.ts` exports:

- `deleteFileFromGitHub()` - Delete file from GitHub repository
- `uploadFileToGitHub()` - Upload file to GitHub repository

## Notes

- Upload requires a folder name (cannot be empty).
- Folder names support letters, numbers, spaces, dashes, underscores, dots, and `/` for nesting.
- Images are stored in nested folders under `/public/assets`.
- File deletion and folder renaming are instant.
- Breadcrumb navigation helps users navigate folder hierarchy.
- Files are automatically synced to GitHub repository on upload and deletion.
- GitHub integration requires a personal access token in `.env.local`.

## Recent Fixes & Important Notes

- **Import Path Fix**: `app/folder/[...folder]/page.tsx` uses relative import `../../components/FolderDetail` instead of `@/app/components/FolderDetail` due to dynamic route nesting.
- **Async Params Fix**: The folder page component is `async` and awaits `params` because in Next.js 13+, route parameters are Promises and must be resolved before accessing them.
- **FolderOverview Text Removed**: Removed the description "All asset folders stored in /public/assets" from the folders section heading.
- **Clickable Folder Cards**: Folder cards in FolderOverview are now wrapped in Next.js `Link` components, making them navigate to the folder detail page.
- **Folder Detail Features**: Users can delete files, rename folders, and navigate the folder hierarchy using breadcrumbs from the detail page.
- **All Images View**: Added `/folder` route to display all images and videos across all folders with upload and delete functionality.
- **GitHub Integration**: Files are automatically synced to GitHub repository on upload and deletion using personal access token.
- **New API Endpoint**: Added `/api/all-files` to retrieve all files across all folders for the all images view.

# Windsurf

## Image and Video Storage

This document will serve as a record for all images and videos uploaded to the repository. Images and videos are stored in the `/public/assets` folder, organized into subfolders as necessary.

## Current Implementation

- Homepage uses a reusable component structure.
- Upload logic is split into dedicated components under `app/components`.
- Uploads are handled by `app/api/upload/route.ts`.
- Folder listing is provided by `app/api/folders/route.ts`.
- Folder details and file management via `app/api/folder/route.ts`.
- Folder and asset helper functions live in `lib/assets.ts`.
- Uploaded files are saved in `public/assets/<folder>`.
- The homepage displays all folders with preview images and item counts.
- Individual folders can be viewed and managed at `/folder/{folderPath}`.

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
  - Rename folder with input and confirm button.
  - Navigate back to parent folder.
  - Breadcrumb navigation for folder hierarchy.

- `app/components/AssetManager.tsx`
  - Manages upload completion and folder refresh state.
  - Coordinates between upload and folder overview.

## API Routes

- `POST /api/upload` - Upload files to a specified folder
- `GET /api/folders` - List all folders with metadata
- `GET /api/folder?path={folderPath}` - Get details of a specific folder
- `DELETE /api/folder?filePath={filePath}` - Delete a file from a folder
- `PATCH /api/folder` - Rename a folder

## Pages

- `/` - Homepage with upload panel and folder overview
- `/folder/{folderPath}` - Folder detail page with file management

## Features

- Drag-and-drop and click-to-select file uploads
- Organize files into named folders and subfolders
- View all folders with previews
- Click folders to open `/folder/{name}` detail view
- Delete individual images/videos from folders
- Rename folders
- Navigate folder hierarchy with breadcrumbs
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

## Notes

- Upload requires a folder name (cannot be empty).
- Folder names support letters, numbers, spaces, dashes, underscores, dots, and `/` for nesting.
- Images are stored in nested folders under `/public/assets`.
- File deletion and folder renaming are instant.
- Breadcrumb navigation helps users navigate folder hierarchy.

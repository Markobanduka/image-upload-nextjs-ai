# Image Upload and Management App

A Next.js application for uploading, viewing, and managing images and videos in organized folders. Features GitHub integration for version control of uploaded assets.

## Usage

### Main Page

- Upload images/videos by specifying a folder name
- View all existing folders

### All Images View (`/folder`)

- View all uploaded images and videos across all folders
- Upload new files directly from this page
- Delete files (removes from both local storage and GitHub)

### Folder View (`/folder/folder-name`)

- Browse specific folders
- View subfolders and files
- Delete individual files

## API Endpoints

- `GET /api/folders` - List all folders
- `GET /api/folder?path=folder-path` - Get folder details
- `GET /api/all-files` - Get all files across all folders
- `POST /api/upload` - Upload files to a folder
- `DELETE /api/folder?filePath=file-path` - Delete a file

## File Structure

```
public/assets/          # Uploaded files stored here
├── folder1/
│   ├── image1.jpg
│   └── image2.png
└── folder2/
    └── video1.mp4
```

## Technologies Used

- Next.js 16
- React 19
- TypeScript
- GitHub API (@octokit/rest)
- React Dropzone

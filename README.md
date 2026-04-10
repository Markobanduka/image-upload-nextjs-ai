# Image Upload and Management App

A Next.js application for uploading, viewing, and managing images and videos in organized folders. Features GitHub integration for version control of uploaded assets.

## Features

- **Upload images and videos** to specific folders
- **View all images** across all folders at `/folder`
- **Browse folders** with hierarchical navigation
- **Delete files** from both local storage and GitHub repository
- **GitHub integration** for version control of assets

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up GitHub Integration

Create a `.env.local` file in the root directory with your GitHub credentials:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=Markobanduka
GITHUB_REPO=image-upload-nextjs-ai
```

#### Getting a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Image Upload App"
4. Select scopes: `repo` (full control of private repositories)
5. Copy the token and paste it in `.env.local`

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

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

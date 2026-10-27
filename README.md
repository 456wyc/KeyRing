# Key Ring - Account Management Tool

<p align="center">
  🌐 <strong>English</strong> · <a href="README_CN.md">简体中文</a> · <a href="https://456wyc.github.io/KeyRing/">Website</a>
</p>

<p align="center">
  <img src="snapshots/image1.png" alt="Key Ring Screenshot" width="720" />
</p>

A secure, cross-platform desktop account management tool built with Electron, React, and TypeScript.

🔗 **Repository**: https://github.com/456wyc/KeyRing · 🌐 **Website**: https://456wyc.github.io/KeyRing/

## ✨ Features

### 🔒 Security & Authentication
- 🔐 **Secure Storage**: All data encrypted with AES using master password
- 🔑 **Master Password Protection**: PBKDF2-based authentication with salt
- 🔁 **Master Password Management**: Change, remove, or re-enable the master password at any time
- 💾 **Data Backup**: Export/import backup functionality
- 🛡️ **Local Storage**: Completely offline, no cloud dependencies

### 📊 Account Management
- ➕ **Custom Fields**: Add any fields you need for each account
- 🏷️ **Multi-Tag System**: Support for multiple tags per account with filtering
- 📋 **Copy to Clipboard**: One-click copying of any field value
- ✏️ **Edit Protection**: Explicit edit mode to prevent accidental changes
- 🔍 **Smart Search**: Search by account name and field content
- 📱 **Dual Layout Views**: Switch between card and list view modes

### 🎲 Password Features
- 🔄 **Random Password Generation**: Customizable password generator
- ⚙️ **Custom Rules**: Per-account password generation rules
- 👁️ **Password Visibility**: Toggle password visibility
- 🎯 **Smart Detection**: Automatic password field recognition

### 🌍 User Experience
- 🌐 **Bilingual Support**: English/Chinese interface switching
- 🎨 **Tag Colors**: Consistent hash-based tag coloring
- 📱 **Responsive Design**: Adapts to different screen sizes
- 🖥️ **Cross-Platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Method 1: Direct Run (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/456wyc/KeyRing.git
   cd KeyRing
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run application**:
   ```bash
   npm run start
   ```
   
   Or simply double-click `run.bat` file (Windows)

### Method 2: Development Mode

```bash
npm run dev
```

This will start both the Vite dev server and Electron in development mode.

## 📸 Screenshots

### Unlock Screen
![Unlock Screen](snapshots/image6.png)

### Account Management (Card View)
![Card View](snapshots/image1.png)

### Account Management (List View)
![List View](snapshots/image3.png)

### Add Account
![Add Account](snapshots/image2.png)

### Backup & Restore (Export)
![Backup Export](snapshots/image4.png)

### Backup & Restore (Import)
![Backup Import](snapshots/image5.png)

## 📦 Building Solutions

If you encounter packaging errors (symlink permission issues), here are solutions:

### Temporary Solution
1. Use `npm run start` or `run.bat` to run directly
2. Application works perfectly, just no installer package

### Packaging Solution
1. **Run Command Prompt as Administrator**
2. **Enable Developer Mode**:
   - Settings → Update & Security → For developers → Developer mode
3. **Or modify configuration**:
   ```bash
   npm install electron-builder@latest
   npm run package:win
   ```

### Network Issues (Download Failures)

electron-builder downloads the Electron binary from GitHub while packaging. If the download fails (`EOF` / `ERR_ELECTRON_BUILDER_CANNOT_EXECUTE`), use the China mirror build:

```bash
npm run package:win:cn
```

This script uses `npmmirror` for the Electron binary and `ELECTRON_BUILDER_BINARIES_MIRROR` for winCodeSign / NSIS resources. Mirrors are also configured in `package.json`:

```json
"electronDownload": { "mirror": "https://npmmirror.com/mirrors/electron/" }
```

## 🎯 Usage Guide

### First Time Setup
1. Launch the app and create a master password
2. Set a strong password (cannot be recovered, remember it!)
3. Enter the main interface

### Master Password Management
1. Click "Change Master Password" in the top-right corner
2. **Change**: Verify current password, then set a new one (data is re-encrypted)
3. **Remove**: Verify current password to disable password protection
4. **Enable**: If protection was removed, set a new master password from the same dialog

### Adding Accounts
1. Click "Add Account" button
2. Enter account name
3. Add tags: Input tag names with autocomplete for existing tags
4. Add/modify fields:
   - Default fields: Username, Password, Email, URL
   - Add any custom fields as needed
   - Rename or delete fields
   - Drag and drop to reorder

### Tag Management
- **Add Tags**: Input tag names when editing accounts
- **Tag Filtering**: Click tag toggle button to show tag filter
- **Multi-select Filter**: Select multiple tags simultaneously
- **Tag Colors**: Each tag automatically gets consistent colors
- **Display Control**: Toggle tag visibility on/off

### View Modes
- **Card View**: Grid layout showing detailed account information
- **List View**: Table layout for quick browsing
- **Layout Switch**: Click grid/list icons in toolbar

### Password Generation
1. **Random Passwords**: Click settings icon next to fields
2. **Custom Rules**: Length, character types, exclude characters
3. **Smart Detection**: Automatically detect password fields

### Search & Filtering
- **Text Search**: Use top search bar for names and field content
- **Tag Filtering**: Filter accounts by tags
- **Combined Filtering**: Use search and tag filters together

### Data Management
- **Data Backup**: Click "Backup & Restore" to export data
- **Data Restore**: Select backup file to import account data
- **Security**: Backup files are JSON format with metadata and version info

### Multi-language
- **Language Switch**: Click language toggle in top-right corner
- **Supported Languages**: Simplified Chinese, English
- **Interface Adaptation**: Complete translation of all interface elements

### Security Features
- **Lock**: Click "Lock" button in top-right corner
- **Auto Lock**: Automatically locks when app closes
- **Password Hide**: Password fields hidden by default, click eye icon to show

## 🔒 Security

- All data stored locally in `~/.keyring` directory
- Uses AES-256 encryption
- Master password hashed with PBKDF2 (100,000 iterations)
- Encryption keys securely derived and never stored in plain text
- No network dependencies, data never uploaded to cloud

## 📁 File Structure

```
key-ring/
├── src/                    # React frontend source
│   ├── components/         # UI components
│   │   ├── AccountCard.tsx       # Account card component
│   │   ├── AccountManager.tsx    # Main management interface
│   │   ├── AccountListView.tsx   # List view component
│   │   ├── BackupRestore.tsx     # Backup/restore component
│   │   ├── TagInput.tsx          # Tag input component
│   │   ├── TagFilter.tsx         # Tag filter component
│   │   └── ...                   # Other components
│   ├── i18n/               # Internationalization
│   │   ├── en.ts           # English translations
│   │   ├── zh.ts           # Chinese translations
│   │   └── types.ts        # Translation type definitions
│   ├── styles/             # Style files
│   └── types.ts            # TypeScript type definitions
├── electron/               # Electron main process
│   ├── main.ts            # Main process entry
│   ├── preload.ts         # Preload script
│   └── storage.ts         # Encrypted storage
├── _doc/                  # Project documentation
├── docs/                  # GitHub Pages site (landing page)
│   ├── index.html         # Project landing page
│   └── screenshots/       # Screenshots used by the landing page
├── snapshots/             # Screenshots for README
├── dist/                  # Build output
└── run.bat               # Windows startup script
```

## 🌐 GitHub Pages

A project landing page is available under the `docs/` folder. To publish it:

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to *Deploy from a branch*, branch `main`, folder `/docs`
4. The landing page will be available at **https://456wyc.github.io/KeyRing/**

The page supports bilingual (EN/中文) switching, feature overview, and an interactive screenshot gallery.

## ❓ FAQ

**Q: What if I forget my master password?**
A: Master password cannot be recovered. It's recommended to backup important account information regularly to other secure locations.

**Q: Where is data stored?**
A: Data is stored in the `.keyring` folder in your user home directory, encrypted.

**Q: Why does packaging fail?**
A: Windows symlink permission issues. Use `npm run start` to run directly.

**Q: How to backup data?**
A: There are two backup methods:
1. **In-app Backup**: Click "Backup & Restore" button to export JSON backup file
2. **Folder Backup**: Copy `~/.keyring` folder to safe location (requires master password to decrypt)

**Q: How to restore data?**
A: Use "Backup & Restore" feature to import previously exported JSON backup files. The system will automatically verify data integrity.

## 🌐 Documentation Languages

- **English** — current document
- [简体中文](README_CN.md) — Chinese documentation

## 📄 License

MIT License - see LICENSE file for details.
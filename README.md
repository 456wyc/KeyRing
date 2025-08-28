# Key Ring - Account Management Tool

A secure, cross-platform desktop account management tool built with Electron, React, and TypeScript.

## Features

- 🔐 **Secure Storage**: All data encrypted with AES using master password
- 🔑 **Master Password Protection**: PBKDF2-based authentication with salt
- ➕ **Custom Fields**: Add any fields you need for each account
- 📋 **Copy to Clipboard**: One-click copying of any field value
- ✏️ **Edit Protection**: Explicit edit mode to prevent accidental changes
- 🎲 **Random Password Generation**: Customizable password generator
- 🔄 **Deterministic Passwords**: Generate consistent passwords from master password + site name
- ⚙️ **Custom Rules**: Per-account password generation rules
- 🔍 **Search**: Find accounts quickly
- 👁️ **Password Visibility**: Toggle password visibility
- 🖥️ **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd key-ring
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Install additional dependencies:
\`\`\`bash
npm install tailwindcss autoprefixer postcss @types/crypto-js
\`\`\`

## Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

This will start both the Vite dev server and Electron in development mode.

## Building

Build the application:
\`\`\`bash
npm run build
\`\`\`

Package for distribution:
\`\`\`bash
# For current platform
npm run package

# For specific platforms
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
\`\`\`

## Usage

1. **First Time Setup**: Create a master password when you first launch the app
2. **Adding Accounts**: Click "Add Account" and customize fields as needed
3. **Managing Fields**: Add, remove, or rename fields for any account
4. **Password Generation**: Use the built-in generator with customizable rules
5. **Deterministic Passwords**: Generate consistent passwords using your master password
6. **Copying Data**: Click the copy icon next to any field to copy to clipboard
7. **Editing**: Click the edit button to modify account details
8. **Security**: The app automatically locks when closed

## Security

- All sensitive data is encrypted using AES-256
- Master password is hashed using PBKDF2 with 100,000 iterations
- Encryption keys are derived securely and never stored in plain text
- Data is stored locally on your machine only

## File Structure

\`\`\`
src/
├── components/
│   ├── AccountCard.tsx       # Individual account display/edit
│   ├── AccountManager.tsx    # Main account management interface
│   ├── AddAccountModal.tsx   # Add new account dialog
│   ├── LoginScreen.tsx       # Master password authentication
│   └── PasswordGenerator.tsx # Password generation tool
├── styles/
│   └── global.css           # Global styles and Tailwind imports
├── types.ts                 # TypeScript type definitions
├── App.tsx                  # Main application component
└── main.tsx                 # React entry point

electron/
├── main.ts                  # Electron main process
├── preload.ts              # Secure IPC bridge
└── storage.ts              # Encrypted data storage
\`\`\`

## License

MIT License - see LICENSE file for details.
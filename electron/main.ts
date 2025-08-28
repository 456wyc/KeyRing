import { app, BrowserWindow, ipcMain, dialog, clipboard } from 'electron'
import * as path from 'path'
import { DataStorage } from './storage'

const isDev = process.env.NODE_ENV === 'development'
let mainWindow: BrowserWindow | null = null
let storage: DataStorage

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default'
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  storage = new DataStorage()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('storage:init', async (_, masterPassword: string) => {
  return await storage.initialize(masterPassword)
})

ipcMain.handle('storage:unlock', async (_, masterPassword: string) => {
  return await storage.unlock(masterPassword)
})

ipcMain.handle('storage:lock', async () => {
  storage.lock()
  return true
})

ipcMain.handle('storage:isUnlocked', () => {
  return storage.isUnlocked()
})

ipcMain.handle('storage:isInitialized', async () => {
  return await storage.isInitialized()
})

ipcMain.handle('storage:getAccounts', async () => {
  return await storage.getAccounts()
})

ipcMain.handle('storage:addAccount', async (_, account: any) => {
  return await storage.addAccount(account)
})

ipcMain.handle('storage:updateAccount', async (_, id: string, account: any) => {
  return await storage.updateAccount(id, account)
})

ipcMain.handle('storage:deleteAccount', async (_, id: string) => {
  return await storage.deleteAccount(id)
})

ipcMain.handle('clipboard:write', (_, text: string) => {
  clipboard.writeText(text)
  return true
})

ipcMain.handle('dialog:showError', async (_, message: string) => {
  if (mainWindow) {
    await dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: 'Error',
      message: message
    })
  }
})
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveApiKey: (provider: string, key: string) => Promise<boolean>
      getApiKey: (provider: string) => Promise<string | null>
    }
  }
}

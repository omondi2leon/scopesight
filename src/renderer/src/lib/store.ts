import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { MODEL_GROUPS, getProviderForModel } from './models'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  options?: string[]
}

export interface PrdVersion {
  id: string
  version: string
  timestamp: string
  title: string
  summary: string
  content: string
  author: string
  changes?: { additions: number; removals: number }
}

interface AppState {
  apiKey: string | null // Keep for backward compatibility/legacy code if any
  apiKeys: Record<string, string | null>
  setApiKey: (key: string | null) => void // Keep for legacy
  setProviderApiKey: (provider: string, key: string | null) => void
  initApiKeys: () => Promise<void>
  saveApiKey: (provider: string, key: string) => Promise<boolean>
  prdContent: string
  setPrdContent: (content: string) => void
  chatHistory: ChatMessage[]
  addChatMessage: (
    role: 'user' | 'assistant' | 'system',
    content: string,
    options?: string[]
  ) => void
  clearChat: () => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  prdHistory: PrdVersion[]
  addPrdVersion: (version: Omit<PrdVersion, 'id' | 'timestamp'>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      apiKeys: {},
      setApiKey: (key) => set({ apiKey: key }),
      setProviderApiKey: (provider, key) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
      initApiKeys: async () => {
        try {
          const providers = ['deepseek', 'openai', 'anthropic', 'gemini']
          const keys: Record<string, string | null> = {}
          for (const p of providers) {
            keys[p] = await window.api.getApiKey(p)
          }
          set({ apiKeys: keys })
          // Fallback for legacy
          if (keys['deepseek']) set({ apiKey: keys['deepseek'] })

          // Auto-default logic: if current model has no key, find the first provider that does
          const currentModel = get().selectedModel
          const currentProvider = getProviderForModel(currentModel)
          if (!keys[currentProvider || '']) {
            const firstProviderWithKey = Object.entries(keys).find(([_, v]) => !!v)?.[0]
            if (firstProviderWithKey) {
              const defaultModel = MODEL_GROUPS.find((g) => g.provider === firstProviderWithKey)
                ?.models[0].id
              if (defaultModel) set({ selectedModel: defaultModel })
            }
          }
        } catch {
          console.error('Failed to load API keys from secure storage')
        }
      },
      initApiKey: async () => {
        // Legacy, redirect to initApiKeys
        const keys = await window.api.getApiKey('deepseek')
        set({ apiKey: keys, apiKeys: { deepseek: keys } })
      },
      saveApiKey: async (provider: string, key: string) => {
        try {
          const saved = await window.api.saveApiKey(provider, key)
          if (saved) {
            set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } }))
            if (provider === 'deepseek') set({ apiKey: key })

            // If we just added the first key ever, or the current model has no key, switch to this provider's default model
            const currentModel = get().selectedModel
            const currentProvider = getProviderForModel(currentModel)
            const allKeys = get().apiKeys
            const keyedProviders = Object.entries(allKeys).filter(([_, v]) => !!v)

            if (keyedProviders.length === 1 || !allKeys[currentProvider || '']) {
              const defaultModel = MODEL_GROUPS.find((g) => g.provider === provider)?.models[0].id
              if (defaultModel) set({ selectedModel: defaultModel })
            }
            return true
          }
        } catch {
          console.error(`Failed to save ${provider} API key to secure storage`)
        }
        return false
      },
      prdContent:
        '# Product Requirements Document\n\n## 1. Introduction\n\n## 2. Problem Statement\n\n## 3. Goals and Objectives\n\n## 4. User Stories\n\n## 5. Technical Requirements\n\n',
      setPrdContent: (content) => set({ prdContent: content }),
      selectedModel: 'deepseek-chat',
      setSelectedModel: (model) => set({ selectedModel: model }),
      chatHistory: [],
      addChatMessage: (role, content, options) =>
        set((state) => ({ chatHistory: [...state.chatHistory, { role, content, options }] })),
      clearChat: () => set({ chatHistory: [] }),
      prdHistory: [],
      addPrdVersion: (version) =>
        set((state) => ({
          prdHistory: [
            {
              ...version,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString()
            },
            ...state.prdHistory
          ]
        }))
    }),
    {
      name: 'prd-creator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        prdContent: state.prdContent,
        chatHistory: state.chatHistory,
        prdHistory: state.prdHistory,
        selectedModel: state.selectedModel
      })
    }
  )
)

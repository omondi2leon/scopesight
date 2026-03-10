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

export interface Draft {
  id: string
  title: string
  updatedAt: string
  prdContent: string
  chatHistory: ChatMessage[]
  prdHistory: PrdVersion[]
}

export const DEFAULT_PRD_CONTENT =
  '# Product Requirements Document\n\n## 1. Introduction\n\n## 2. Problem Statement\n\n## 3. Goals and Objectives\n\n## 4. User Stories\n\n## 5. Technical Requirements\n\n'

interface AppState {
  drafts: Draft[]
  currentDraftId: string | null
  createNewDraft: () => void
  loadDraft: (id: string) => void
  deleteDraft: (id: string) => void
  _syncDraft: (state: AppState, updates: Partial<AppState>) => Partial<AppState>

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
      drafts: [],
      currentDraftId: null,
      createNewDraft: () => {
        const id = crypto.randomUUID()
        const newDraft: Draft = {
          id,
          title: 'Untitled PRD',
          updatedAt: new Date().toISOString(),
          prdContent: DEFAULT_PRD_CONTENT,
          chatHistory: [],
          prdHistory: []
        }
        set((state) => ({
          drafts: [newDraft, ...state.drafts],
          currentDraftId: id,
          prdContent: newDraft.prdContent,
          chatHistory: newDraft.chatHistory,
          prdHistory: newDraft.prdHistory
        }))
      },
      loadDraft: (id: string) => {
        const draft = get().drafts.find((d) => d.id === id)
        if (draft) {
          set({
            currentDraftId: id,
            prdContent: draft.prdContent,
            chatHistory: draft.chatHistory,
            prdHistory: draft.prdHistory
          })
        }
      },
      deleteDraft: (id: string) => {
        set((state) => {
          const newDrafts = state.drafts.filter((d) => d.id !== id)
          let nextState: Partial<AppState> = { drafts: newDrafts }

          if (state.currentDraftId === id) {
            if (newDrafts.length > 0) {
              const nextDraft = newDrafts[0]
              nextState = {
                ...nextState,
                currentDraftId: nextDraft.id,
                prdContent: nextDraft.prdContent,
                chatHistory: nextDraft.chatHistory,
                prdHistory: nextDraft.prdHistory
              }
            } else {
              // Trigger createNewDraft manually or just reset
              const newId = crypto.randomUUID()
              const nextDraft: Draft = {
                id: newId,
                title: 'Untitled PRD',
                updatedAt: new Date().toISOString(),
                prdContent: DEFAULT_PRD_CONTENT,
                chatHistory: [],
                prdHistory: []
              }
              nextState = {
                drafts: [nextDraft],
                currentDraftId: newId,
                prdContent: nextDraft.prdContent,
                chatHistory: nextDraft.chatHistory,
                prdHistory: nextDraft.prdHistory
              }
            }
          }
          return nextState
        })
      },
      _syncDraft: (state, updates) => {
        const currentDraftId = state.currentDraftId
        if (!currentDraftId) return updates

        const prdContent = updates.prdContent !== undefined ? updates.prdContent : state.prdContent
        const chatHistory =
          updates.chatHistory !== undefined ? updates.chatHistory : state.chatHistory
        const prdHistory = updates.prdHistory !== undefined ? updates.prdHistory : state.prdHistory

        let title = 'Untitled PRD'
        if (prdHistory.length > 0) {
          title = prdHistory[0].title
        } else {
          const match = prdContent.match(/^#\s+(.+)$/m)
          if (match && match[1].trim() !== 'Product Requirements Document') {
            title = match[1].trim()
          }
        }

        const newDrafts = state.drafts.map((d) =>
          d.id === currentDraftId
            ? {
                ...d,
                prdContent,
                chatHistory,
                prdHistory,
                title,
                updatedAt: new Date().toISOString()
              }
            : d
        )
        return { ...updates, drafts: newDrafts }
      },

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
      prdContent: DEFAULT_PRD_CONTENT,
      setPrdContent: (content) => {
        set((state) => get()._syncDraft(state, { prdContent: content }))
      },
      selectedModel: 'deepseek-chat',
      setSelectedModel: (model) => set({ selectedModel: model }),
      chatHistory: [],
      addChatMessage: (role, content, options) => {
        set((state) =>
          get()._syncDraft(state, {
            chatHistory: [...state.chatHistory, { role, content, options }]
          })
        )
      },
      clearChat: () => {
        set((state) => get()._syncDraft(state, { chatHistory: [] }))
      },
      prdHistory: [],
      addPrdVersion: (version) => {
        set((state) =>
          get()._syncDraft(state, {
            prdHistory: [
              {
                ...version,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString()
              },
              ...state.prdHistory
            ]
          })
        )
      }
    }),
    {
      name: 'prd-creator-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Migration logic for existing users
        if (state) {
          if (state.drafts.length === 0) {
            // First time migrating
            const hasExistingContent =
              state.prdContent !== DEFAULT_PRD_CONTENT ||
              state.chatHistory.length > 0 ||
              state.prdHistory.length > 0
            if (hasExistingContent) {
              const id = crypto.randomUUID()
              let title = 'Imported PRD'
              if (state.prdHistory.length > 0) {
                title = state.prdHistory[0].title
              } else {
                const match = state.prdContent?.match(/^#\s+(.+)$/m)
                if (match) title = match[1].trim()
              }
              state.drafts = [
                {
                  id,
                  title,
                  updatedAt: new Date().toISOString(),
                  prdContent: state.prdContent || DEFAULT_PRD_CONTENT,
                  chatHistory: state.chatHistory || [],
                  prdHistory: state.prdHistory || []
                }
              ]
              state.currentDraftId = id
            } else {
              // Create a blank draft
              state.createNewDraft()
            }
          } else if (state.currentDraftId) {
            state.loadDraft(state.currentDraftId)
          }
        }
      },
      partialize: (state) => ({
        drafts: state.drafts,
        currentDraftId: state.currentDraftId,
        selectedModel: state.selectedModel
      })
    }
  )
)

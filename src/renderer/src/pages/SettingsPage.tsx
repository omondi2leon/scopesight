import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useStore } from '../lib/store'
import { MODEL_GROUPS } from '../lib/models'

const SettingsPage = () => {
  const { apiKeys, saveApiKey, selectedModel, setSelectedModel } = useStore()
  const [activeTab, setActiveTab] = useState<
    'general' | 'members' | 'security' | 'notifications' | 'resources'
  >('general')
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({})
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>({})

  useEffect(() => {
    const timer = setTimeout(() => setSaveStatus({}), 3000)
    return () => clearTimeout(timer)
  }, [saveStatus])

  const handleSaveKey = async (provider: string) => {
    const input = keyInputs[provider]
    if (!input || !input.trim()) return
    setIsSaving(true)
    const saved = await saveApiKey(provider, input.trim())
    setIsSaving(false)
    if (saved) {
      setSaveStatus((s) => ({ ...s, [provider]: 'success' }))
      setKeyInputs((i) => ({ ...i, [provider]: '' }))
      setEditingProvider(null)
    } else {
      setSaveStatus((s) => ({ ...s, [provider]: 'error' }))
    }
  }

  return (
    <div className="flex w-full h-full bg-stone-50/50">
      <aside className="w-72 border-r border-stone-200/60 bg-white/50 p-6 space-y-2">
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 px-3">
          Account
        </div>
        <button
          onClick={() => setActiveTab('general')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'general'
              ? 'bg-stone-100 text-stone-900'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'members'
              ? 'bg-stone-100 text-stone-900'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path>
          </svg>
          Workspace Members
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'security'
              ? 'bg-stone-100 text-stone-900'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
          API Keys & Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'notifications'
              ? 'bg-stone-100 text-stone-900'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 01-3.46 0"></path>
          </svg>
          Notifications
        </button>
        <div className="h-8"></div>
        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 px-3">
          Resources
        </div>
        <button
          onClick={() => setActiveTab('resources')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all',
            activeTab === 'resources'
              ? 'bg-stone-100 text-stone-900'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
          )}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          Community & Help
        </button>
      </aside>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-12 lg:p-20">
        <div className="max-w-4xl mx-auto space-y-16">
          {activeTab === 'general' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h2 className="font-serif text-3xl text-stone-900 mb-2">General Preferences</h2>
                <p className="text-stone-500 text-sm">
                  Configure your core AI interaction and export defaults.
                </p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-card">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                    Primary AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-peach-200 outline-none appearance-none cursor-pointer"
                  >
                    {MODEL_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-card">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                    Default Export Format
                  </label>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 bg-sage-50 text-sage-800 border border-sage-200 rounded-lg text-xs font-semibold">
                      Markdown
                    </button>
                    <button className="flex-1 py-2 px-3 bg-stone-50 text-stone-500 border border-stone-100 rounded-lg text-xs font-semibold hover:bg-stone-100">
                      Notion
                    </button>
                    <button className="flex-1 py-2 px-3 bg-stone-50 text-stone-500 border border-stone-100 rounded-lg text-xs font-semibold hover:bg-stone-100">
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'members' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-serif text-3xl text-stone-900 mb-2">Workspace Members</h2>
                  <p className="text-stone-500 text-sm">
                    Manage who has access to your PRD drafts and components.
                  </p>
                </div>
                <button className="px-4 py-2 bg-stone-900 text-white rounded-full text-xs font-semibold shadow-lg shadow-stone-900/10 hover:bg-stone-800 transition-colors">
                  Invite Member
                </button>
              </header>
              <div className="bg-white border border-stone-200 rounded-2xl shadow-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Member
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Role
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr className="hover:bg-stone-50/50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-peach-100 border border-peach-200 flex items-center justify-center text-peach-500 font-bold text-xs">
                          PT
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900">Product Team</div>
                          <p className="text-xs text-stone-500">michael@scopesight.app</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-xs text-stone-600">
                          Admin
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-stone-300">—</td>
                    </tr>
                    <tr className="hover:bg-stone-50/50">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-500 font-bold text-xs">
                          SA
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-900">Sarah Chen</div>
                          <p className="text-xs text-stone-500">sarah@scopesight.app</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-stone-100 rounded text-xs text-stone-600">
                          Editor
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-semibold text-rose-400 hover:text-rose-600 transition-colors">
                          Remove
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h2 className="font-serif text-3xl text-stone-900 mb-2">Security & APIs</h2>
                <p className="text-stone-500 text-sm">
                  Manage your connection to external AI providers.
                </p>
              </header>
              <div className="space-y-6">
                {[
                  { id: 'deepseek', name: 'DeepSeek', desc: 'Efficiency & Reasoning' },
                  { id: 'openai', name: 'OpenAI', desc: 'GPT-4o & o1 Models' },
                  { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3.5 Models' },
                  { id: 'gemini', name: 'Gemini', desc: 'Google AI Models' }
                ].map((provider) => (
                  <div
                    key={provider.id}
                    className="bg-white border border-stone-200 rounded-2xl shadow-card p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-stone-900">
                          {provider.name} API Key
                        </h4>
                        <p className="text-xs text-stone-400">{provider.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {apiKeys[provider.id] ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            <span className="text-xs font-medium text-stone-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            <span className="text-xs font-medium text-stone-500">
                              Not configured
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {editingProvider === provider.id ? (
                      <>
                        <input
                          type="password"
                          value={keyInputs[provider.id] || ''}
                          onChange={(e) =>
                            setKeyInputs((prev) => ({ ...prev, [provider.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveKey(provider.id)
                            if (e.key === 'Escape') setEditingProvider(null)
                          }}
                          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                          autoFocus
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm font-mono text-stone-700 mb-4 focus:ring-2 focus:ring-peach-200 outline-none"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setEditingProvider(null)}
                            className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveKey(provider.id)}
                            disabled={!(keyInputs[provider.id] || '').trim() || isSaving}
                            className="px-4 py-1.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? 'Saving...' : 'Save Key'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="password"
                          value={apiKeys[provider.id] ? '••••••••••••••••••••••••' : ''}
                          disabled
                          placeholder={`No ${provider.name} API key set`}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-mono text-stone-500 mb-4"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => setEditingProvider(provider.id)}
                            className="text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                          >
                            {apiKeys[provider.id] ? 'Update Key' : 'Add Key'}
                          </button>
                        </div>
                      </>
                    )}

                    {saveStatus[provider.id] === 'success' && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-medium">
                        API key saved and encrypted successfully.
                      </div>
                    )}
                    {saveStatus[provider.id] === 'error' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium">
                        Failed to save API key. Please try again.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(activeTab === 'notifications' || activeTab === 'resources') && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-20 h-20 rounded-3xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-6 text-stone-300">
                {activeTab === 'notifications' ? (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 01-3.46 0"></path>
                  </svg>
                ) : (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                )}
              </div>
              <h2 className="font-serif text-3xl text-stone-900 mb-2">Coming Soon</h2>
              <p className="text-stone-500 max-w-sm text-center">
                {activeTab === 'notifications'
                  ? 'Notification preferences are currently being integrated. Check back soon!'
                  : 'Our community forum and help resources are currently under construction.'}
              </p>
              <button
                onClick={() => setActiveTab('general')}
                className="mt-8 px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-sm font-semibold transition-colors"
              >
                Go to General Settings
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

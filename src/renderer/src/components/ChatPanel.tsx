import { useState, useRef, useEffect } from 'react'
import { useStore } from '../lib/store'
import { sendMessage } from '../services'
import { Send, Loader2 } from 'lucide-react'
import { diffWords } from 'diff'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { MODEL_GROUPS } from '../lib/models'
import { ChevronDown } from 'lucide-react'

const ChatPanel = () => {
  const {
    chatHistory,
    addChatMessage,
    apiKeys,
    prdContent,
    setPrdContent,
    addPrdVersion,
    selectedModel,
    setSelectedModel
  } = useStore()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isLoading])

  const handleSend = async (manualContent?: string) => {
    const messageContent = manualContent || input
    const hasAnyKey = Object.values(apiKeys).some((k) => !!k)
    if (!messageContent.trim() || !hasAnyKey) return

    setInput('')
    addChatMessage('user', messageContent)
    setIsLoading(true)

    try {
      // Send history + new message
      const messages = chatHistory.map((m) => ({ role: m.role, content: m.content }))
      messages.push({ role: 'user', content: messageContent })

      const response = await sendMessage(apiKeys, messages, prdContent, selectedModel)

      if (response.type === 'question') {
        addChatMessage('assistant', response.content, response.options)
      } else if (response.type === 'update') {
        // Compute change stats
        const parts = diffWords(prdContent, response.content)
        const additions = parts
          .filter((p) => p.added)
          .reduce((sum, p) => sum + p.value.split(/\s+/).filter(Boolean).length, 0)
        const removals = parts
          .filter((p) => p.removed)
          .reduce((sum, p) => sum + p.value.split(/\s+/).filter(Boolean).length, 0)

        // Extract title from first heading or use fallback
        const titleMatch = response.content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : 'PRD Update'

        // Snapshot version
        const versionCount = useStore.getState().prdHistory.length
        addPrdVersion({
          version: `v1.${versionCount}.0`,
          title,
          summary: `Updated via: "${messageContent.slice(0, 80)}${messageContent.length > 80 ? '...' : ''}"`,
          content: response.content,
          author: 'AI Assistant',
          changes: { additions, removals }
        })

        setPrdContent(response.content)
        addChatMessage('assistant', 'I have updated the PRD based on your feedback.')
      } else {
        addChatMessage('system', `Error: ${response.content}`)
      }
    } catch (error) {
      addChatMessage('system', 'Failed to communicate with AI.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide pb-40">
        {chatHistory.length === 0 ? (
          <div className="space-y-4">
            <div className="mb-10">
              <div className="w-10 h-10 rounded-full bg-peach-100 flex items-center justify-center text-peach-500 mb-6">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                </svg>
              </div>
              <h2 className="font-serif text-3xl text-stone-900 mb-4 leading-tight">
                Draft your next <br />
                big idea.
              </h2>
              <p className="text-stone-500 leading-relaxed text-base">
                ScopeSight helps you transform product concepts into structured PRDs through guided
                AI conversation.
              </p>
            </div>

            {!Object.values(apiKeys).some((k) => !!k) && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-2">
                <p className="text-sm font-semibold text-amber-800 mb-1">API key required</p>
                <p className="text-xs text-amber-600 mb-3">
                  Add an API key to start generating PRDs.
                </p>
                <button
                  onClick={() => navigate('/settings')}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-full text-xs font-semibold hover:bg-amber-700 transition-colors"
                >
                  Go to Settings
                </button>
              </div>
            )}

            <div className="space-y-4">
              <button
                className={clsx(
                  'w-full group relative',
                  !Object.values(apiKeys).some((k) => !!k) && 'opacity-50 pointer-events-none'
                )}
                onClick={() => handleSend('Start New PRD')}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-stone-900 to-stone-700 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative flex items-center justify-center gap-3 w-full py-4 bg-stone-900 text-white rounded-xl font-medium shadow-float transition-transform active:scale-[0.98]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Start New PRD
                </div>
              </button>
              <p className="text-[10px] text-center uppercase tracking-widest text-stone-400 font-bold py-2">
                Or start from a template
              </p>
              <div
                className={clsx(
                  'grid grid-cols-1 gap-2',
                  !Object.values(apiKeys).some((k) => !!k) && 'opacity-50 pointer-events-none'
                )}
              >
                <button
                  className="flex items-center gap-3 p-3 text-left border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all group"
                  onClick={() => handleSend('Generate a SaaS Dashboard PRD')}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                      <path d="M3 9h18"></path>
                      <path d="M9 21V9"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">SaaS Dashboard</div>
                    <div className="text-[10px] text-stone-400">Analytics & Data visualization</div>
                  </div>
                </button>
                <button
                  className="flex items-center gap-3 p-3 text-left border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all group"
                  onClick={() => handleSend('Generate a Mobile App Feature PRD')}
                >
                  <div className="w-8 h-8 rounded-lg bg-peach-50 flex items-center justify-center text-peach-500">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"></path>
                      <path d="M12 8v4"></path>
                      <path d="M12 16h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-800">Mobile Feature</div>
                    <div className="text-[10px] text-stone-400">UX flows & App interactions</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-stone-100">
              <div className="p-4 rounded-xl bg-stone-100/50 border border-stone-200/50">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                  Pro Tip
                </span>
                <p className="text-xs text-stone-500 italic">
                  "I want to build a marketplace for artisanal coffee beans..."
                </p>
                <p className="text-[10px] text-stone-400 mt-2">
                  Try typing a broad idea to get started.
                </p>
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} className="group">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                    msg.role === 'assistant'
                      ? 'bg-gradient-to-tr from-indigo-300 to-purple-200 text-indigo-900'
                      : 'bg-stone-200 text-stone-600'
                  )}
                >
                  {msg.role === 'assistant' ? 'AI' : 'U'}
                </div>
                <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                  {msg.role === 'assistant' ? 'Response' : 'Input'}
                </span>
              </div>
              <div className="pl-9">
                <div className="text-stone-800 text-lg font-serif leading-relaxed mb-4 whitespace-pre-wrap">
                  {msg.content}
                </div>
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {msg.options.map((option, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => {
                          if (!isLoading) {
                            handleSend(option)
                          }
                        }}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm font-medium text-stone-600 transition-colors text-left"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-300 to-purple-200 flex items-center justify-center text-[10px] text-indigo-900 font-bold">
                AI
              </div>
              <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                Thinking...
              </span>
            </div>
            <div className="pl-9">
              <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-stone-100 bg-white absolute bottom-0 w-full">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-peach-200 to-orange-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-peach-50 border border-peach-200 rounded-xl p-4 transition-all focus-within:ring-2 focus-within:ring-peach-200 focus-within:bg-white">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-peach-500 uppercase tracking-widest">
                Additional Context
              </label>
              <span className="text-[10px] text-stone-400 font-medium">
                Shift + Enter for new line
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!isLoading) handleSend()
                }
              }}
              placeholder={
                Object.values(apiKeys).some((k) => !!k)
                  ? 'Add specific details or constraints...'
                  : 'Please set API Key in settings first'
              }
              disabled={!Object.values(apiKeys).some((k) => !!k) || isLoading}
              className="w-full bg-transparent border-none p-0 text-stone-700 placeholder-peach-500/40 font-serif text-lg focus:ring-0 resize-none h-12 outline-none"
            />
            <div className="flex justify-between items-center mt-2">
              <div className="flex-1 flex items-center">
                {Object.values(apiKeys).filter((k) => !!k).length > 1 && (
                  <div className="relative group/model">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="appearance-none bg-stone-200/40 border-none rounded-lg pl-2 pr-6 py-1 text-[10px] font-bold text-stone-600 focus:ring-0 cursor-pointer outline-none transition-all hover:bg-stone-200"
                    >
                      {MODEL_GROUPS.filter((g) => !!apiKeys[g.provider]).map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.models.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none transition-transform group-hover/model:text-stone-600" />
                  </div>
                )}
                {Object.values(apiKeys).filter((k) => !!k).length === 1 && (
                  <span className="text-[10px] font-semibold text-stone-400 px-1">
                    {MODEL_GROUPS.find((g) => !!apiKeys[g.provider])?.models.find(
                      (m) => m.id === selectedModel
                    )?.name || selectedModel}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!Object.values(apiKeys).some((k) => !!k) || isLoading || !input.trim()}
                className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-md disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel

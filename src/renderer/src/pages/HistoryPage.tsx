import { useStore } from '../lib/store'
import { diffWords } from 'diff'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'

const HistoryPage = () => {
  const { drafts, currentDraftId, prdHistory, setPrdContent, loadDraft, deleteDraft } = useStore()
  const navigate = useNavigate()
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'preview' | 'diff'>('preview')
  const [activeTab, setActiveTab] = useState<'versions' | 'drafts'>('versions')

  const selectedVersion = useMemo(() => {
    if (!selectedVersionId && prdHistory.length > 0) return prdHistory[0]
    return prdHistory.find((v) => v.id === selectedVersionId) || null
  }, [prdHistory, selectedVersionId])

  const previousVersion = useMemo(() => {
    if (!selectedVersion) return null
    const currentIndex = prdHistory.findIndex((v) => v.id === selectedVersion.id)
    if (currentIndex < prdHistory.length - 1) {
      return prdHistory[currentIndex + 1]
    }
    return null
  }, [prdHistory, selectedVersion])

  const diff = useMemo(() => {
    if (!selectedVersion) return []

    // Compare with previous version, or empty string if this is the first version
    const oldText = previousVersion ? previousVersion.content : ''
    const newText = selectedVersion.content
    return diffWords(oldText, newText)
  }, [selectedVersion, previousVersion])

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex w-full h-full bg-stone-50/50">
      <aside className="w-[480px] flex flex-col border-r border-stone-200 bg-white z-10">
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-stone-900">History</h2>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setActiveTab('versions')}
                className={clsx(
                  'text-xs font-semibold uppercase tracking-widest transition-colors pb-1 border-b-2',
                  activeTab === 'versions'
                    ? 'text-peach-500 border-peach-500'
                    : 'text-stone-400 border-transparent hover:text-stone-600'
                )}
              >
                Current PRD
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={clsx(
                  'text-xs font-semibold uppercase tracking-widest transition-colors pb-1 border-b-2',
                  activeTab === 'drafts'
                    ? 'text-peach-500 border-peach-500'
                    : 'text-stone-400 border-transparent hover:text-stone-600'
                )}
              >
                All Drafts
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-4 relative">
          <div className="absolute left-[51px] top-0 bottom-0 w-px bg-gradient-to-b from-stone-200 to-stone-200"></div>

          <div className="space-y-10">
            {activeTab === 'versions' ? (
              prdHistory.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-300">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 mb-1">No Versions Yet</h3>
                  <p className="text-xs text-stone-500 mb-4 px-4 text-balance">
                    Versions will automatically be saved here as you iterate on your document.
                  </p>
                </div>
              ) : (
                prdHistory.map((version, index) => {
                  const isCurrent = index === 0
                  const isSelected = selectedVersion?.id === version.id
                  return (
                    <div
                      key={version.id}
                      onClick={() => setSelectedVersionId(version.id)}
                      className={clsx(
                        'relative pl-12 group cursor-pointer transition-all',
                        !isCurrent && 'hover:translate-x-1'
                      )}
                    >
                      <div
                        className={clsx(
                          'absolute w-2.5 h-2.5 rounded-full z-10 transition-colors',
                          isCurrent
                            ? 'left-[-4px] top-1.5 w-3 h-3 bg-peach-500 ring-4 ring-peach-50'
                            : 'left-[-3px] top-1.5 bg-stone-300 group-hover:bg-stone-400'
                        )}
                      ></div>

                      <div
                        className={clsx(
                          'p-4 rounded-xl transition-all border',
                          isCurrent
                            ? 'bg-peach-50/50 ring-1 ring-peach-100 border-transparent'
                            : 'hover:bg-stone-50 border-transparent hover:border-stone-100',
                          isSelected && !isCurrent ? 'bg-stone-50 border-stone-100 shadow-sm' : ''
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={clsx(
                              'text-[10px] font-bold uppercase tracking-widest',
                              isCurrent ? 'text-peach-500' : 'text-stone-400'
                            )}
                          >
                            {isCurrent ? 'Current Version' : formatDate(version.timestamp)}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            {version.version}
                          </span>
                        </div>
                        <h4
                          className={clsx(
                            'font-medium mb-1',
                            isCurrent ? 'text-stone-900' : 'text-stone-800'
                          )}
                        >
                          {version.title}
                        </h4>
                        <p className="text-sm text-stone-500 mb-3 line-clamp-2">
                          {version.summary}
                        </p>

                        {isCurrent ? (
                          <div className="flex items-center gap-4 text-[10px] text-stone-400 font-medium">
                            <span>{formatDate(version.timestamp)}</span>
                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                            <span>{version.author}</span>
                          </div>
                        ) : (
                          <>
                            {version.changes && (
                              <div className="flex gap-1.5 mb-3">
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded">
                                  +{version.changes.additions} additions
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 rounded">
                                  -{version.changes.removals} removals
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedVersionId(version.id)
                                }}
                                className="px-3 py-1 bg-white border border-stone-200 rounded-md text-[10px] font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                              >
                                Compare
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPrdContent(version.content)
                                  navigate('/editor')
                                }}
                                className="px-3 py-1 bg-white border border-stone-200 rounded-md text-[10px] font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                              >
                                Restore
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              )
            ) : // DRAFTS TAB
            drafts.length === 0 ? (
              <div className="py-20 text-center">
                <h3 className="text-sm font-semibold text-stone-900 mb-1">No Drafts Found</h3>
              </div>
            ) : (
              drafts.map((draft) => {
                const isCurrent = draft.id === currentDraftId
                return (
                  <div
                    key={draft.id}
                    onClick={() => {
                      loadDraft(draft.id)
                      navigate('/editor')
                    }}
                    className={clsx(
                      'relative pl-12 group cursor-pointer transition-all',
                      !isCurrent && 'hover:translate-x-1'
                    )}
                  >
                    <div
                      className={clsx(
                        'absolute w-2.5 h-2.5 rounded-full z-10 transition-colors',
                        isCurrent
                          ? 'left-[-4px] top-1.5 w-3 h-3 bg-sage-500 ring-4 ring-sage-50'
                          : 'left-[-3px] top-1.5 bg-stone-300 group-hover:bg-stone-400'
                      )}
                    ></div>

                    <div
                      className={clsx(
                        'p-4 rounded-xl transition-all border',
                        isCurrent
                          ? 'bg-sage-50 ring-1 ring-sage-200 border-transparent'
                          : 'hover:bg-stone-50 border-transparent hover:border-stone-100'
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          {formatDate(draft.updatedAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteDraft(draft.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                          title="Delete Draft"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <h4 className={clsx('font-medium mb-1 text-stone-900')}>
                        {draft.title || 'Untitled PRD'}
                      </h4>
                      <div className="flex gap-3 text-[10px] text-stone-500 mt-3 font-medium">
                        <span className="bg-white px-2 py-1 rounded-md border border-stone-200 shadow-sm">
                          {draft.prdHistory.length} Versions
                        </span>
                        <span className="bg-white px-2 py-1 rounded-md border border-stone-200 shadow-sm">
                          {draft.chatHistory.length} Messages
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </aside>

      <section className="flex-1 flex flex-col items-center overflow-y-auto relative">
        {prdHistory.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-24 h-24 rounded-3xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-6">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h2 className="font-serif text-3xl text-stone-900 mb-2">No History to Display</h2>
            <p className="text-stone-500 max-w-sm">
              To start capturing history, generate a PRD and iteration versions will be tracked here
              automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-20 flex items-center justify-center gap-2 py-4 w-full bg-stone-50/80 backdrop-blur-sm">
              {previousVersion && viewMode === 'diff' && (
                <div className="bg-stone-900 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl">
                  Comparing {selectedVersion?.version} vs {previousVersion.version}
                </div>
              )}
              <div className="bg-white border border-stone-200 rounded-full p-0.5 flex shadow-sm">
                <button
                  onClick={() => setViewMode('preview')}
                  className={clsx(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors',
                    viewMode === 'preview'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:text-stone-900'
                  )}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('diff')}
                  className={clsx(
                    'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors',
                    viewMode === 'diff'
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-500 hover:text-stone-900'
                  )}
                >
                  Diff
                </button>
              </div>
            </div>

            <div className="w-full max-w-[800px] bg-white shadow-soft rounded-lg p-16 relative border border-stone-100 min-h-[800px] mx-12 mb-12">
              <div className="absolute left-6 top-0 bottom-0 w-px border-l border-dashed border-stone-200"></div>

              <header className="mb-12 border-b border-stone-100 pb-8 pl-8">
                <h1 className="font-serif text-5xl text-stone-900 mb-8 tracking-tight">
                  {selectedVersion?.title || 'Document History'}
                </h1>
                <div className="flex gap-8">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                      Version
                    </span>
                    <div className="flex items-center gap-2">
                      {previousVersion && viewMode === 'diff' && (
                        <>
                          <span className="font-mono text-sm text-stone-400 line-through">
                            {previousVersion.version}
                          </span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-peach-500"
                          >
                            <path d="M5 12h14m-7-7 7 7-7 7"></path>
                          </svg>
                        </>
                      )}
                      <span className="font-mono text-sm font-bold text-peach-500">
                        {selectedVersion?.version}
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              <div className="pl-8 space-y-12">
                {viewMode === 'preview' ? (
                  <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-strong:text-stone-900 prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedVersion?.content || ''}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg leading-relaxed font-serif text-stone-600 whitespace-pre-wrap">
                      {diff.map((part, index) => {
                        if (part.added) {
                          return (
                            <span
                              key={index}
                              className="bg-green-50 text-green-800 border-b-2 border-green-200"
                            >
                              {part.value}
                            </span>
                          )
                        }
                        if (part.removed) {
                          return (
                            <span
                              key={index}
                              className="bg-red-50 text-red-800 line-through decoration-red-300 opacity-60"
                            >
                              {part.value}
                            </span>
                          )
                        }
                        return <span key={index}>{part.value}</span>
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default HistoryPage

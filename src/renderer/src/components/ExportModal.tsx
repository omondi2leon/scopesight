import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useStore } from '../lib/store'

const ExportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { prdContent } = useStore()
  const [step, setStep] = useState<'options' | 'success'>('options')
  const [exportedAs, setExportedAs] = useState('')

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('options')
      setExportedAs('')
    }
  }, [isOpen])

  // Extract title from PRD content
  const titleMatch = prdContent.match(/^#\s+(.+)$/m)
  const docTitle = titleMatch ? titleMatch[1] : 'PRD Document'

  const downloadAsFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExport = async (type: string) => {
    if (type === 'markdown' || type === 'download') {
      downloadAsFile(prdContent, `${docTitle.replace(/[^a-zA-Z0-9]/g, '-')}.md`, 'text/markdown')
      onClose()
    } else if (type === 'clipboard') {
      await navigator.clipboard.writeText(prdContent)
      setExportedAs('clipboard')
      setStep('success')
    } else if (type === 'pdf') {
      const originalTitle = document.title
      document.title = docTitle
      window.print()
      document.title = originalTitle
      onClose()
    } else if (type === 'notion') {
      // Notion export = copy markdown (Notion supports pasting markdown)
      await navigator.clipboard.writeText(prdContent)
      setExportedAs('clipboard (paste into Notion)')
      setStep('success')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center p-6 print:hidden">
      <div
        className={clsx(
          'bg-white rounded-3xl shadow-modal w-full max-w-[540px] border border-stone-200/50 overflow-hidden transition-all duration-300',
          step === 'success' ? 'scale-100 opacity-100' : 'scale-100 opacity-100'
        )}
      >
        {step === 'options' ? (
          <>
            <div className="px-8 pt-8 pb-6 flex justify-between items-start">
              <div>
                <h2 className="font-serif text-3xl text-stone-900">Export Document</h2>
                <p className="text-stone-500 text-sm mt-1">{docTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="px-8 space-y-8 pb-10">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                  Select Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleExport('markdown')}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-stone-900 bg-stone-50 text-stone-900 transition-all group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">Markdown</span>
                  </button>
                  <button
                    onClick={() => handleExport('notion')}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-stone-100 hover:border-stone-200 bg-white text-stone-500 transition-all group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">Notion</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-stone-100 hover:border-stone-200 bg-white text-stone-500 transition-all group active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <path d="M9 15h3a2 2 0 1 0 0-4H9v6"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold">PDF</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">
                  Destination
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => handleExport('download')}
                    className="w-full group bg-white border border-stone-200 hover:border-stone-900 rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-stone-900">Download as File</p>
                        <p className="text-xs text-stone-400">Saves directly to your device</p>
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-stone-300 group-hover:text-stone-900"
                    >
                      <path d="M9 18l6-6-6-6"></path>
                    </svg>
                  </button>

                  <button
                    onClick={() => handleExport('clipboard')}
                    className="w-full group bg-white border border-stone-200 hover:border-stone-900 rounded-2xl p-4 flex items-center justify-between transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-stone-900">Copy to Clipboard</p>
                        <p className="text-xs text-stone-400">Quickly paste anywhere</p>
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-stone-300 group-hover:text-stone-900"
                    >
                      <path d="M9 18l6-6-6-6"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 px-8 py-5 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400 italic">Export your document</span>
              <button
                onClick={onClose}
                className="text-sm font-medium text-stone-500 hover:text-stone-900"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="bg-stone-900 text-white px-8 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-sage-500 flex items-center justify-center mb-2 animate-bounce">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-serif">Export Successful</h3>
              <p className="text-stone-400 text-sm mt-1">
                {exportedAs === 'clipboard'
                  ? 'Content copied to clipboard.'
                  : exportedAs.includes('Notion')
                    ? 'Content copied to clipboard. Paste into Notion.'
                    : `Document has been exported as ${exportedAs}.`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-2 bg-white text-stone-900 rounded-full text-sm font-bold hover:bg-stone-100 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExportModal

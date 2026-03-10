import RichTextEditor from './RichTextEditor'
import { useStore } from '../lib/store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import clsx from 'clsx'
import { useState, useRef, useEffect } from 'react'
import { diffLines } from 'diff'
import ExportModal from './ExportModal'

const DEFAULT_PRD_CONTENT =
  '# Product Requirements Document\n\n## 1. Introduction\n\n## 2. Problem Statement\n\n## 3. Goals and Objectives\n\n## 4. User Stories\n\n## 5. Technical Requirements\n\n'

const PrdEditor = () => {
  const { prdContent, setPrdContent } = useStore()
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>(() => {
    return prdContent === DEFAULT_PRD_CONTENT || !prdContent ? 'edit' : 'preview'
  })
  const previewRef = useRef<HTMLDivElement>(null)
  const prevContentRef = useRef<string>(prdContent)

  useEffect(() => {
    if (viewMode === 'preview' && prdContent !== prevContentRef.current) {
      // Find the first changed line
      const changes = diffLines(prevContentRef.current, prdContent)
      let firstChangeIndex = -1
      let currentLineLine = 0

      for (const change of changes) {
        if (change.added || change.removed) {
          firstChangeIndex = currentLineLine
          break
        }
        if (!change.removed) {
          currentLineLine += change.count || 0
        }
      }

      if (firstChangeIndex !== -1 && previewRef.current) {
        const totalLines = prdContent.split('\n').length
        const scrollRatio = firstChangeIndex / totalLines

        // Use requestAnimationFrame to ensure the DOM has updated with new markdown content
        requestAnimationFrame(() => {
          if (previewRef.current) {
            const scrollHeight = previewRef.current.scrollHeight

            // Scroll to the estimated position
            // If it's near the end, just scroll to bottom
            if (scrollRatio > 0.9) {
              previewRef.current.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
              })
            } else {
              previewRef.current.scrollTo({
                top: Math.max(0, scrollHeight * scrollRatio - 100), // Offset a bit to see context
                behavior: 'smooth'
              })
            }
          }
        })
      }
      prevContentRef.current = prdContent
    }
  }, [prdContent, viewMode])

  // Automatically switch to edit mode if the content becomes empty (e.g. after a clear)
  useEffect(() => {
    if ((prdContent === DEFAULT_PRD_CONTENT || !prdContent) && viewMode === 'preview') {
      // Use requestAnimationFrame to push setState to the next frame,
      // avoiding cascading render issues.
      requestAnimationFrame(() => {
        setViewMode('edit')
      })
    }
  }, [prdContent, viewMode])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setPrdContent(value)
    }
  }

  const isEmpty = !prdContent || prdContent === DEFAULT_PRD_CONTENT

  return (
    <>
      <div className="hidden print:block w-full">
        <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-strong:text-stone-900 prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{prdContent}</ReactMarkdown>
        </div>
      </div>
      <div className="print:hidden w-full h-full flex flex-col items-center justify-start">
        <div
          className={clsx(
            'sticky top-0 mb-8 z-30 bg-white/80 backdrop-blur-md border border-stone-200/50 shadow-sm rounded-full px-2 py-1.5 flex gap-1 print:hidden transition-all duration-500',
            isEmpty ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'
          )}
        >
          <div className="bg-stone-100 rounded-full p-0.5 flex">
            <button
              onClick={() => setViewMode('preview')}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
                viewMode === 'preview'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              )}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
                viewMode === 'edit'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              )}
            >
              Edit
            </button>
          </div>
          <div className="w-px h-4 bg-stone-200 my-auto mx-1"></div>
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold transition-colors shadow-lg shadow-stone-900/10 flex items-center gap-2 active:scale-95"
          >
            Export
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        <div
          className={clsx(
            'w-full max-w-[800px] shadow-soft rounded-lg relative border transition-all duration-500 ease-in-out print:shadow-none print:border-none print:m-0 print:p-8 print:w-full print:max-w-none',
            isEmpty && viewMode === 'preview'
              ? 'bg-white/40 border-stone-100/50 flex flex-col items-center justify-center text-center backdrop-blur-sm min-h-[1000px] p-16'
              : 'bg-white border-stone-100'
          )}
        >
          <div className="absolute left-6 top-0 bottom-0 w-px border-l border-dashed border-stone-200 print:hidden" />

          {isEmpty && viewMode === 'preview' ? (
            <div className="max-w-md space-y-4 opacity-60">
              <div className="w-20 h-20 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-8 rotate-3 mx-auto">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E8E6E1"
                  strokeWidth="1.5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h3 className="font-serif text-3xl text-stone-400 mb-4">Your PRD will appear here</h3>
              <p className="text-stone-400 font-medium">
                Choose a template or start a new conversation on the left to begin generating your
                document.
              </p>
              <div className="mt-12 space-y-4 w-full">
                <div className="h-4 bg-stone-100 rounded-full w-3/4 mx-auto animate-pulse"></div>
                <div className="h-4 bg-stone-100 rounded-full w-full mx-auto animate-pulse delay-75"></div>
                <div className="h-4 bg-stone-100 rounded-full w-2/3 mx-auto animate-pulse delay-150"></div>
              </div>
            </div>
          ) : viewMode === 'preview' ? (
            <div
              ref={previewRef}
              className="p-16 pl-20 print:pl-8 max-h-[calc(100vh-250px)] overflow-y-auto scroll-smooth"
            >
              <div
                id="prd-preview-content"
                className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-strong:text-stone-900 prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{prdContent}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="relative pl-4 print:pl-0 h-[calc(100vh-250px)] w-full">
              <RichTextEditor content={prdContent} onChange={handleEditorChange} />
            </div>
          )}
        </div>
      </div>
      <div className="h-16 print:hidden"></div>
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </>
  )
}

export default PrdEditor

import ChatPanel from '../components/ChatPanel'
import PrdEditor from '../components/PrdEditor'

const EditorPage = () => {
  return (
    <div className="flex w-full h-full print:block print:bg-white print:h-auto">
      <div className="w-[420px] flex flex-col border-r border-stone-200/60 bg-white/50 backdrop-blur-sm relative z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] shrink-0 print:hidden">
        <ChatPanel />
      </div>
      <div className="flex-1 bg-stone-100/50 relative flex flex-col items-center justify-start overflow-y-auto p-8 lg:p-12 print:overflow-visible print:bg-white print:p-0 print:block print:h-auto">
        <PrdEditor />
      </div>
    </div>
  )
}

export default EditorPage

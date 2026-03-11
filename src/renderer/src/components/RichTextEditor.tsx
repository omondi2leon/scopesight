import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import clsx from 'clsx'
import { useEffect } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Undo,
  Redo
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const buttons = [
    {
      icon: <Bold className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Bold (Cmd+B)'
    },
    {
      icon: <Italic className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italic (Cmd+I)'
    },
    {
      icon: <Strikethrough className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      title: 'Strikethrough (Cmd+Shift+X)'
    },
    { divider: true },
    {
      icon: <Heading1 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
      title: 'Heading 1 (Cmd+Alt+1)'
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
      title: 'Heading 2 (Cmd+Alt+2)'
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive('heading', { level: 3 }),
      title: 'Heading 3 (Cmd+Alt+3)'
    },
    { divider: true },
    {
      icon: <List className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Bullet List'
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Ordered List'
    },
    { divider: true },
    {
      icon: <Quote className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Blockquote'
    },
    {
      icon: <Code className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      title: 'Inline Code'
    },
    {
      icon: <Code2 className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Code Block'
    },
    { divider: true },
    {
      icon: <Undo className="w-4 h-4" />,
      onClick: () => editor.chain().focus().undo().run(),
      isDisabled: !editor.can().undo(),
      title: 'Undo (Cmd+Z)'
    },
    {
      icon: <Redo className="w-4 h-4" />,
      onClick: () => editor.chain().focus().redo().run(),
      isDisabled: !editor.can().redo(),
      title: 'Redo (Cmd+Shift+Z)'
    }
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-stone-200 bg-stone-50/50 sticky top-0 z-10 backdrop-blur-sm rounded-t-lg">
      {buttons.map((btn, index) => {
        if (btn.divider) {
          return <div key={`div-${index}`} className="w-px h-5 bg-stone-300 mx-1" />
        }
        return (
          <button
            key={`btn-${index}`}
            onClick={btn.onClick}
            disabled={btn.isDisabled}
            title={btn.title}
            className={clsx(
              'p-2 rounded-md transition-colors',
              btn.isActive
                ? 'bg-stone-200 text-stone-900'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
              btn.isDisabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {btn.icon}
          </button>
        )
      })}
    </div>
  )
}

const RichTextEditor = ({ content, onChange, disabled }: RichTextEditorProps) => {
  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true
      })
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange((editor.storage as any).markdown.getMarkdown())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-strong:text-stone-900 prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono focus:outline-none min-h-[500px]'
      }
    }
  })

  // Synchronize external content changes
  useEffect(() => {
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      // Small timeout to prevent cyclic updates
      setTimeout(() => {
        editor.commands.setContent(content)
      }, 0)
    }
  }, [content, editor])

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto p-8 relative">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
}

export default RichTextEditor

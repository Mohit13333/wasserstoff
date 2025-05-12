import { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Color } from '@tiptap/extension-color'
import { UserCursor } from './UserCursor'
import type { User } from '../types'
import { FiBold, FiItalic, FiUnderline, FiList } from 'react-icons/fi'

interface EditorProps {
  ydoc: Y.Doc
  provider: any
  currentUser: User
  users: Map<number, { user: User }>
  isSynced: boolean
}

export const Editor = ({ ydoc, provider, currentUser, users, isSynced }: EditorProps) => {
  const [collaborators, setCollaborators] = useState<User[]>([])
  const [cursorPositions, setCursorPositions] = useState<
    Record<number, { x: number; y: number }>
  >({})

  useEffect(() => {
    const collaboratorsArray = Array.from(users.values())
      .map((state) => state.user)
      .filter((user) => user.id !== currentUser.id)
    setCollaborators(collaboratorsArray)
  }, [users, currentUser.id])

  const editor = useEditor({
    extensions: [StarterKit, Color],
    content: '<p>Start collaborating!</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  // Set up Y.js binding - Updated version
  useEffect(() => {
    if (!editor || !provider || !isSynced) return

    const yXmlFragment = ydoc.getXmlFragment('tiptap')
    
    // Only set content if the fragment exists
    if (yXmlFragment.firstChild) {
      editor.commands.setContent(yXmlFragment.firstChild.toDOM())
    }

    // Set up the mapping
    provider.binding.mapping.set('tiptap', yXmlFragment)

    return () => {
      if (provider.binding) {
        provider.binding.destroy()
      }
    }
  }, [editor, provider, ydoc, isSynced])

  // Handle cursor positions
  const handleEditorMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editor || !provider) return

      const { clientX, clientY } = e
      const { top, left } = e.currentTarget.getBoundingClientRect()
      const x = clientX - left
      const y = clientY - top

      provider.awareness.setLocalStateField('cursor', { x, y })
    },
    [editor, provider]
  )

  // Track cursor positions of other users
  useEffect(() => {
    if (!provider) return

    const handleAwarenessChange = () => {
      const states = provider.awareness.getStates()
      const positions: Record<number, { x: number; y: number }> = {}

      states.forEach((state, clientId) => {
        if (clientId !== provider.awareness.clientID && state.cursor) {
          positions[clientId] = state.cursor
        }
      })

      setCursorPositions(positions)
    }

    provider.awareness.on('change', handleAwarenessChange)
    return () => {
      provider.awareness.off('change', handleAwarenessChange)
    }
  }, [provider])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div className="relative">
      <div className="flex gap-2 p-2 border-b">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Bold"
        >
          <FiBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Italic"
        >
          <FiItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Underline"
        >
          <FiUnderline />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          title="Bullet List"
        >
          <FiList />
        </button>
      </div>

      <div
        className="border rounded-lg overflow-hidden relative"
        onMouseMove={handleEditorMouseMove}
      >
        <EditorContent editor={editor} />
        {collaborators.map((user) => (
          <UserCursor
            key={user.id}
            user={user}
            position={cursorPositions[user.id]}
          />
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Collaborators:</h3>
        <div className="flex flex-wrap gap-2">
          <div
            key={currentUser.id}
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs"
            style={{ backgroundColor: `${currentUser.color}20`, border: `1px solid ${currentUser.color}` }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentUser.color }}
            />
            {currentUser.name} (you)
          </div>
          {collaborators.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs"
              style={{ backgroundColor: `${user.color}20`, border: `1px solid ${user.color}` }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              {user.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
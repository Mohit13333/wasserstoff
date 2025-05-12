import { useState } from 'react'
import { useYjs } from './hooks/useYjs'
import { Editor } from './components/Editor'
import { LoginModal } from './components/LoginModal'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const roomId = 'collab-editor-demo-room'
  const { ydoc, provider, users } = useYjs(roomId, username || 'anonymous')

  const handleLogin = (name: string) => {
    setUsername(name)
  }

  if (!username) {
    return <LoginModal onLogin={handleLogin} />
  }

  const currentUser = Array.from(users.values()).find(
    (state) => state.user.name === username
  )?.user

  if (!currentUser) {
    return <div>Loading user data...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Real-Time Collaborative Editor</h1>
      <p className="mb-4">
        Room: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span>
      </p>
      {provider && ydoc && currentUser ? (
        <Editor
          ydoc={ydoc}
          provider={provider}
          currentUser={currentUser}
          users={users}
        />
      ) : (
        <div>Loading editor...</div>
      )}
    </div>
  )
}

export default App
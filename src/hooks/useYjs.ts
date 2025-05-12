import { useEffect, useState } from "react"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"
import { setupAwareness } from "../lib/awareness"
import type { AwarenessUsers, User } from "../types"

export const useYjs = (roomId: string, username: string) => {
  const [ydoc] = useState<Y.Doc>(new Y.Doc())
  const [provider, setProvider] = useState<WebrtcProvider | null>(null)
  const [users, setUsers] = useState<AwarenessUsers>(new Map())
  const [isSynced, setIsSynced] = useState(false)
  const [connectionError, setConnectionError] = useState<string|null>(null)

  useEffect(() => {
    let retries = 0
    const maxRetries = 3
    let yProvider: WebrtcProvider | null = null

    const connect = () => {
      try {
        yProvider = new WebrtcProvider(roomId, ydoc, {
          signaling: [
            'wss://y-webrtc-signaling-production.up.railway.app',
            'wss://y-webrtc-signaling.onrender.com',
            'ws://localhost:4444'
          ],
          maxConns: 20 + Math.floor(Math.random() * 15),
          filterBcConns: true,
          peerOpts: {
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
              ]
            }
          }
        })

        yProvider.on('synced', () => setIsSynced(true))
        yProvider.on('connection-close', () => setIsSynced(false))
        yProvider.on('connection-error', (error) => {
          console.error('Connection error:', error)
          if (retries < maxRetries) {
            retries++
            setTimeout(connect, 1000 * retries)
          } else {
            setConnectionError('Failed to connect after multiple attempts')
          }
        })

        const cleanupAwareness = setupAwareness(
          yProvider.awareness,
          username,
          setUsers
        )

        setProvider(yProvider)

        return () => {
          cleanupAwareness()
          yProvider?.destroy()
        }
      } catch (error) {
        setConnectionError(error.message)
      }
    }

    connect()

    return () => {
      yProvider?.destroy()
    }
  }, [ydoc, roomId, username])

  return { ydoc, provider, users, isSynced, connectionError }
}
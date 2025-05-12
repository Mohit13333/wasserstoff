import { getRandomColor } from '../utils/randomColor'
import type { User } from '../types/index.ts'
export const setupAwareness = (
  awareness: any,
  username: string,
  setUsers: (users: Map<number, { user: User }>) => void
) => {
  awareness.setLocalStateField('user', {
    id: awareness.clientID,
    name: username,
    color: getRandomColor(),
  })

  const updateUsers = () => {
    const states = awareness.getStates()
    setUsers(new Map(states))
  }

  awareness.on('change', updateUsers)
  updateUsers()

  return () => {
    awareness.off('change', updateUsers)
  }
}
import type { User } from '../types/index.ts'
interface UserCursorProps {
  user: User
  position?: { x: number; y: number }
}

export const UserCursor = ({ user, position }: UserCursorProps) => {
  if (!position) return null

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className="text-xs text-white px-2 py-1 rounded-full"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: user.color }}
      />
    </div>
  )
}
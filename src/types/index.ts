// src/types/index.ts
export interface User {
  id: number
  name: string
  color: string
}

export type AwarenessUsers = Map<number, { user: User }>
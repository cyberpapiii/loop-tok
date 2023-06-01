import { TiktokChat } from '@/app/types'
import { create } from 'zustand'

type ChatsStore = {
  chats: TiktokChat[],
  pinnedChat: TiktokChat | null,
  appendChat: (newChat: TiktokChat) => void,
  setPinnedChat: (newChat: TiktokChat) => void,
  clearChats: () => void,
}

export const useChatStore = create<ChatsStore>((set) => ({
  chats: [],
  pinnedChat: null,
  setPinnedChat: (newChat: any) => set((state: {chats: any[]}) => ({
    pinnedChat: newChat,
  })),
  appendChat: (newChat: any) => set((state: {chats: any[]}) => ({
    chats: [
      ...state.chats,
      newChat
    ]
  })),
  clearChats: () => set({ chats: [] }),
}))
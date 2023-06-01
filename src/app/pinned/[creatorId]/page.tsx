"use client";

import { useEffect } from 'react'
import io, { Socket } from 'socket.io-client';
import Chat from '@/app/components/chat';
import { useChatStore } from '@/stores/chat';

let socket: Socket | undefined;

export default function PinnedChatPage(props: any) {
  const creator = props.params.creatorId;
  const { pinnedChat, setPinnedChat } = useChatStore();

  const initializeSocket = async () => {
    await fetch("/api/socketio");
    console.log("Intializing Socket.io...")

    socket = io({ path: '/api/connect' })

    socket.on('connect', () => {
      console.log('Connected to socket!')
      socket?.emit('subscribeToPinnedMessage', creator);
    })

    socket.on('disconnect', () => {
      console.log('disconnect')
    })

    socket.on('pinnedChat', (chat) => {
      setPinnedChat(chat);
    })
  };

  useEffect(() => {
    initializeSocket();

    const interval = setInterval(() => {
      socket?.emit('ping', creator);
    }, 10000)

    return () => {
      clearInterval(interval);
      socket && socket.disconnect()
    }
  }, []);

  return <>{pinnedChat && <Chat pinned chat={pinnedChat} />}</>
}
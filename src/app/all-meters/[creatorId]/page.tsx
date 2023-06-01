"use client";

import { useEffect } from 'react'
import io, { Socket } from 'socket.io-client';
import { useMetersStore } from '@/stores/meters';
import Meter from '@/app/components/meter';

let socket: Socket | undefined;

export default function AllMetersPage(props: any) {
  const creator = props.params.creatorId;
  const { meters, setMeters } = useMetersStore();

  const initializeSocket = async () => {
    await fetch("/api/socketio");
    console.log("Intializing Socket.io...")

    socket = io({ path: '/api/connect' })

    socket.on('connect', () => {
      console.log('Connected to socket!')
      socket?.emit('subscribe', creator);
    })

    socket.on('disconnect', () => {
      console.log('disconnect')
    })

    socket.on('allMeters', (allMeters) => {
      setMeters(allMeters);
    })
  };

  useEffect(() => {
    initializeSocket();

    const interval = setInterval(() => {
      socket?.emit('ping', creator);
    }, 5000)

    return () => {
      clearInterval(interval);
      socket && socket.disconnect()
    }
  }, [])

  useEffect(() => {
    initializeSocket();

    return () => {
      socket && socket.disconnect()
    }
  }, [])

  if (!meters) return null;

  return meters.map((meter: any, idx: number) => {
    return <Meter key={idx} {...meter}/>
  });
}
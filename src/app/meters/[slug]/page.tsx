"use client";

import { useEffect } from 'react'
import io, { Socket } from 'socket.io-client';
import { useMetersStore } from '@/stores/meters';
import Meter from '@/app/components/meter';

let socket: Socket | undefined;

export default function MeterPage(props: any) {
  const meterId = props.params.slug;
  const { watchedMeters, updateMeter } = useMetersStore();

  const initializeSocket = async () => {
    await fetch("/api/socketio");
    console.log("Intializing Socket.io...")

    socket = io({ path: '/api/connect' })

    socket.on('meterUpdate', (meter) => {
      console.log("METER FROM SERVER", meter);
      if (!!meter) {
        updateMeter(meter);
      }
    })

    socket.on('connect', () => {
      console.log('Connected. Firing subscribeToMeter', meterId);
      socket?.emit('subscribeToMeter', meterId);
    })
  };

  useEffect(() => {
    initializeSocket();

    return () => {
      socket && socket.disconnect()
    }
  }, [])

  const meter = watchedMeters[meterId];

  return <>
    {meter && <Meter {...meter} />}
  </>
}
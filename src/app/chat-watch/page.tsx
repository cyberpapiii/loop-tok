"use client";

import { useEffect, useState, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation';
import io, { Socket } from 'socket.io-client';

import CopyableLink from '../components/copyableLink';
import Meter from '../components/meter';
import mainStyles from './../page.module.css';
import styles from './page.module.css';
import { useChatStore } from '@/stores/chat';
import { useMetersStore } from '@/stores/meters';
import { TiktokChat } from '../types';
import Chat from '../components/chat';

const HOST_URL = "localhost:3000"

let socket: Socket | undefined;

export default function ChatWatch() {
  const searchParams = useSearchParams();
  const { chats, pinnedChat, appendChat, setPinnedChat} = useChatStore();
  const { meters, setMeters } = useMetersStore();
  const creator = searchParams?.get("creator");
  // const [activeSocket, setActiveSocket] = useState<Socket | null>(null);

  const initializeSocket = async () => {
    await fetch("/api/socketio");
    console.log("Intializing Socket.io...")

    socket = io({ path: '/api/connect' })

    socket.on('connect', () => {
      console.log('Connected to socket!')
      socket?.emit('subscribe', creator);
      socket?.emit('subscribeToPinnedMessage', creator);
    })

    socket.on('disconnect', () => {
      console.log('disconnect')
    })

    socket.on('chat', (data) => {
      appendChat(data.data);
    })

    socket.on('pinnedChat', (chat) => {
      setPinnedChat(chat);
    })

    socket.on('allMeters', (allMeters) => {
      // console.log("METERS FROM SERVER", allMeters);
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

  const createMeter = (event: FormEvent) => {
    event.preventDefault();
    const data = new FormData(event.target as HTMLFormElement);
    const meter: any = {
      creatorId: creator,
      keyword: data.get('keyword'),
      goal: Number(data.get('goal')),
      color: data.get('color'),
    };

    if (data.get('header')) {
      meter.header = data.get('header');
    }

    console.log("CREATING METER", JSON.stringify(meter, null, 2))
    socket?.emit('createMeter', meter);
  }

  const removeMeter = (meterId: string) => {
    socket?.emit('removeMeter', meterId);
  }

  const pinChat = (chat: TiktokChat | null) => {
    socket?.emit('pinChat', {creatorId: creator, chat});
  }

  return <main className={mainStyles.main}>
    <div className={styles.split}>
      <div style={{flex: 1}}>
        <h2>
          Dashboard for {creator}
        </h2>

        <form onSubmit={createMeter} className={styles.form}>
          <h3>Create meter</h3>

          <div>
            <label htmlFor="meterHeader">Header</label>
            <input type="text" name="header" id="meterHeader" placeholder="e.g. Jacket color" />
          </div>
          <div className="field">
            <label htmlFor="meterKeyword">Keyword</label>
            <input type="text" name="keyword" id="meterKeyword" placeholder="e.g. !green" />
          </div>
          <div className="field">
            <label htmlFor="meterGoal">Goal</label>
            <input type="text" name="goal" id="meterGoal" defaultValue={100} placeholder="100" />
          </div>
          <div className="field">
            <label htmlFor="meterColor">Color</label>
            <input type="text" name="color" id="meterColor" placeholder="#d54b6c" />
          </div>
          <input className={styles.submitCorner} type="submit" value="Create" />
        </form>

        <hr />
            <CopyableLink dest={HOST_URL + `/all-meters/${creator}`} />
        <hr />

        {meters && meters.map((meter: any, idx: number) => {
          return <div key={idx} style={{marginBottom: '1em'}}>
            <Meter {...meter}/>
            <div>
              <CopyableLink dest={HOST_URL + `/meters/${meter.id}`} />
              <button className="button button__destructive" onClick={() => removeMeter(meter.id)}>
                Remove
              </button>
            </div>
          </div>
        })}
      </div>

      <div className={styles.chatHalf}>
        <h2>Chat for {creator} &nbsp;
          <CopyableLink dest={HOST_URL + `/pinned/${creator}`} />
        </h2>
        {pinnedChat && <>
          <div className={styles.pinnedChat}>
            <h3 style={{position: 'relative'}}>
              Pinned
              <button
                className={`button button__destructive ${styles.pinChatButton}`}
                onClick={()=> pinChat(null)}
              >Unpin</button>
            </h3>
            <Chat chat={pinnedChat} />
          </div>
        </>}
        <div className={styles.chatScrollContainer}>
          <div style={{overflowAnchor: 'none'}}>
            {chats.map((chatData: TiktokChat, idx: number) => {
              return <div key={idx} className={styles.chatMessage}>
                <button
                  className={`button ${styles.pinChatButton}`}
                  onClick={()=> pinChat(chatData)}
                >Pin</button>
                <Chat chat={chatData} />
              </div>
            }).slice(-1000, 1000)}
            <div style={{height: '4px', background: "#455252" }} />
          </div>
        </div>
      </div>
    </div>
  </main>;
}
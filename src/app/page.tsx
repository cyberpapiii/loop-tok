"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [creator, setCreator] = useState("tv_asahi_news");
  const normalizedCreator = creator.replace(/^@/, '');

  return (
    <main className={styles.main}>
      <h1>Loop TikTok Tools</h1>

      <label htmlFor="creator-name">Creator</label>
      <input id="creator-name" placeholder="e.g. tv_asahi_news"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
      ></input>

      <hr/>

      {!creator.length && <h3>Please enter a creator username to access the tools!</h3> }

      {!!creator.length && <>
        <Link href={`/chat-watch?creator=${normalizedCreator}`} aria-disabled={!creator.length}>
          <h3>Chat watch {creator.length ? `for @${normalizedCreator}` : ''} &gt;</h3>
        </Link>
      </>}
    </main>
  )
}

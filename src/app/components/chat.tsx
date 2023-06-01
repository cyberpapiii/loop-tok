import {FC} from 'react';
import type { TiktokChat } from '../types';
import styles from './chat.module.css';

const Chat: FC<{chat: TiktokChat, pinned?: boolean}> = ({
  pinned,
  chat
}) => {
  return <div className={styles.chat + ` ${pinned ? styles.chatPinned : ''}`}>
    <div className={styles.profile}>
     <img src={chat.profilePictureUrl ? chat.profilePictureUrl.replace(/^https:/, 'http:') : 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'} height={28} width={28} />

      <div className={styles.username}>{pinned ? '@' : ''}{chat.uniqueId}{pinned ? ':' : ''}</div>
    </div>
    <p className={styles.comment}>{chat.comment}</p>
  </div>
}

export default Chat;
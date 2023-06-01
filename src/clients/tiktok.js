import { EventEmitter } from 'stream';

const { WebcastPushConnection } = require('tiktok-live-connector');

const isInLastTwoMinutes = (epochMs) => {
  return (new Date().getTime() - epochMs) < 180000;
}

export const createConnection = (username) => {
  // Create a new wrapper object and pass the username
  let tiktokLiveConnection = new WebcastPushConnection(username);
  const emitter = new EventEmitter();
  let lastClientListenedAt = new Date().getTime();

  // Connect to the chat (await can be used as well)
  const connect = () => {
    tiktokLiveConnection.connect().then(state => {
      console.log("[TikTok connect]", username);
      emitter.emit("__connected");
    }).catch(err => {
      console.error('[TikTok] FAILED to connect to', err);
      emitter.emit('disconnect');
    })
  }

  // Allow-list for the events we care about
  // https://github.com/zerodytrash/TikTok-Live-Connector#events
  const EVENTS = ['chat', 'emote']

  for (let eventType of EVENTS) {
    tiktokLiveConnection.on(eventType, data => {
      emitter.emit(eventType, data)
    })
  }

  connect();

  tiktokLiveConnection.on('disconnect', () => {
    console.log("[TikTok disconnect]:", username);
    emitter.emit('disconnect');
    sleep(20 + Math.random() * 250);

    // Retry connection if someone's still listening
    if (isInLastTwoMinutes(lastClientListenedAt)) {
      console.log("[TikTok] Attempting reconnect:", username);
      connect();
    }
  });

  const interval = setInterval(() => {
    if (!isInLastTwoMinutes(lastClientListenedAt)) {
      // SHUT DOWN CONNECTION
      console.log(`[TikTok] Disconnecting from:`, username);
      console.log(`--- Last listen >2 min ago:`, lastClientListenedAt);
      tiktokLiveConnection.disconnect();
      emitter.emit('disconnect');
      clearInterval(interval);
    }
  }, 20000)

  // [!] OPPOSITE DIRECTION EVENTS
  // [!] OPPOSITE DIRECTION EVENTS
  emitter.on('__ping', () => {
    lastClientListenedAt = new Date().getTime();
    console.log(`[TikTok] Listen ping:`, username, lastClientListenedAt);
  });

  emitter.on('__disconnect', () => {
    tiktokLiveConnection.disconnect();
  });

  return emitter;
}
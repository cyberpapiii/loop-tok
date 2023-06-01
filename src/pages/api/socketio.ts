import { Server } from 'socket.io'
import { createConnection } from '../../clients/tiktok'
import cors from 'cors';
import {
  createMeter,
  getForCreator,
  getMeter,
  processChat,
  removeMeter
} from '@/serverStores/meters';
import { getPinnedForCreator, setPinnedForCreator } from '@/serverStores/pinnedMessages';

// Create a new instance of the CORS middleware
const corsMiddleware = cors();

let activeChannels: Record<string, {
  status: 'inactive' | 'connecting' | 'listening';
  tiktokEmitter: any;
}> = {};

/* Broadcast active connections to console:
setInterval(() => {
  console.log("CONNECTIONS:");
  for(let channel of Object.keys(activeChannels)) {
    console.log(channel, '-', activeChannels[channel].status)
  }
}, 15000)
*/

// Sets up listeners for a single creator's channel / single TikTok connection
const setupListeners = (creatorId: string, io: Server, tiktokEmitter: any) => {
  tiktokEmitter.on('chat', (data: any) => {
    io.to(`chat:${creatorId}`).emit("chat", {
      creatorId: creatorId,
      data,
    })
    const updatedMeters = processChat(creatorId, data.comment);

    for (let meter of updatedMeters) {
      console.log("Firing into", `meter:${meter.id}`)
      io.to(`meter:${meter.id}`).emit('meterUpdate', meter);
    }

    io.to(`allMeters:${creatorId}`).emit('allMeters', getForCreator(creatorId));
  })

  tiktokEmitter.on('disconnect', () => {
    console.log("Setting status to inactive")
    activeChannels[creatorId].status = 'inactive';
  })
  tiktokEmitter.on('__error', () => {
    console.log("Setting status to inactive")
    activeChannels[creatorId].status = 'inactive';
  })
  tiktokEmitter.on('__connected', () => {
    activeChannels[creatorId].status = 'listening';
  })
}

const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    console.log("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~")
    console.log("~ Socket Connection ~")
    console.log("~ ~ ~ Starting! ~ ~ ~")
    console.log("~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~")

    const io = new Server(res.socket.server, {
      path: '/api/connect',
      addTrailingSlash: false,
    });

    io.on('connection', socket => {
      socket.broadcast.emit('New connection');

      socket.on('subscribe', (creatorId) => {
        if (!activeChannels[creatorId] || activeChannels[creatorId].status === 'inactive') {
          if (activeChannels[creatorId]?.tiktokEmitter) {
            activeChannels[creatorId]?.tiktokEmitter?.emit('__disconnect');
          }

          // START LISTENING
          console.log("STARTING LISTENING FOR:", creatorId);
          const tiktokEmitter = createConnection(creatorId);

          activeChannels[creatorId] = {
            status: 'connecting',
            tiktokEmitter,
          }

          setupListeners(creatorId, io, activeChannels[creatorId].tiktokEmitter);
        }

        socket.join('chat:' + creatorId);
        socket.join('allMeters:' + creatorId);
        setTimeout(() => {
          io.to(`allMeters:${creatorId}`).emit('allMeters', getForCreator(creatorId));
          io.to(`pinned:${creatorId}`).emit('pinnedChat', getPinnedForCreator(creatorId));
        }, 100);
        return activeChannels[creatorId].status;
      });

      socket.on('subscribeToMeter', (meterId) => {
        socket.join(`meter:${meterId}`);
        setTimeout(() => {
          io.to(`meter:${meterId}`).emit('meterUpdate', getMeter(meterId));
        }, 100);
      });

      socket.on('subscribeToPinnedMessage', (creatorId) => {
        socket.join(`pinned:${creatorId}`);
        setTimeout(() => {
          io.to(`pinned:${creatorId}`).emit('pinnedChat', getPinnedForCreator(creatorId));
        }, 100)
      });

      socket.on('pinChat', ({creatorId, chat}) => {
        setPinnedForCreator(creatorId, chat);
        io.to(`pinned:${creatorId}`).emit('pinnedChat', chat);
      })

      socket.on('removeMeter', (meterId) => {
        const removedMeter = removeMeter(meterId);
        if (removedMeter) {
          io.to(`allMeters:${removedMeter.creatorId}`).emit('allMeters', getForCreator(removedMeter.creatorId));
        }
      });

      socket.on('getMeter', (meterId) => {
        io.to(`meter:${meterId}`).emit('meterUpdate', getMeter(meterId));
      });

      socket.on('createMeter', (meter) => {
        createMeter(
          meter.creatorId,
          meter.keyword, 
          meter.goal,
          meter.color,
          meter.header,
        );

        io.to(`allMeters:${meter.creatorId}`).emit('allMeters', getForCreator(meter.creatorId));
        console.log("[Meter] created.", getForCreator(meter.creatorId))
      });

      socket.on('ping', (creatorId) => {
        activeChannels[creatorId]?.tiktokEmitter?.emit('__ping');
      });
    })

    corsMiddleware(req, res, () => {
      res.socket.server.io = io
      res.end()
    })

    return;
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler
import sirv from 'sirv'
import path from 'path'
import cors from 'cors'
import express from 'express'
import EventEmitter from 'events'
import { Station, PUBLIC_EVENTS, SHUFFLE_METHODS } from '@fridgefm/radio-core'
import type { Request, Response, NextFunction } from 'express'
import type { ShallowTrackMeta } from '@fridgefm/radio-core/lib/base/Track/Track.types'

const streamEvent = new EventEmitter()

let currentTrack: ShallowTrackMeta
const isDev = process.env.NODE_ENV === 'development'
const host = process.env.APP_IP ?? 'localhost'
const port = process.env.APP_PORT ?? 8000
const server = express()
server.use(cors())

const musicPath = path.join('./music')

const station = new Station({
  verbose: true
})

station.addFolder(musicPath)

station
  .on(PUBLIC_EVENTS.NEXT_TRACK, async (track) => {
    currentTrack = await track.getMetaAsync()
    streamEvent.emit('push', currentTrack)
  })

station
  .on(PUBLIC_EVENTS.START, () => {
    station.reorderPlaylist(v => v.concat(v))
  })

station
  .on(PUBLIC_EVENTS.RESTART, () => {
    station.reorderPlaylist(v => v.concat(v))
  })

station.on(PUBLIC_EVENTS.ERROR, console.error)

server.get('/current', eventsHandler)

server.get('/stream', (req, res) => {
  // @ts-ignore
  station.connectListener(req, res)
})

server
  .get('/controls/next', (req, res) => {
    station.next()
    res.json({ message: 'Switched to next track' })
  })

server
  .get('/controls/shuffle', (req, res) => {
    station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle())
    res.json({ message: 'Playlist shuffled' })
  })

server
  .get('/controls/playlist', (req, res) => {
    const plist = station.getPlaylist()
    res.json(plist)
  })

server
  // .use('/', sirv('web/dist'))
  .listen(port, host, () => {
    station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle())
    station.start()
    console.log(`Server started at http://${host}:${port}`)
  })

function eventsHandler(req: Request, res: Response, next: NextFunction) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  }

  res.writeHead(200, headers)
  res.write(`data: ${JSON.stringify(currentTrack)}\n\n`)

  streamEvent.on('push', (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  })
}

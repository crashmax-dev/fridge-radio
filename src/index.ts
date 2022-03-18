import sirv from 'sirv'
import path from 'path'
import express from 'express'
import { Station, PUBLIC_EVENTS, SHUFFLE_METHODS } from '@fridgefm/radio-core'
import type { ShallowTrackMeta } from '@fridgefm/radio-core/lib/base/Track/Track.types'

let currentTrack: ShallowTrackMeta
const host = process.env.APP_IP ?? 'localhost'
const port = process.env.APP_PORT ?? 8000
const server = express()

const musicPath = path.join('./music')

const station = new Station({
  verbose: true
})

station.addFolder(musicPath)

station
  .on(PUBLIC_EVENTS.NEXT_TRACK, async (track) => {
    currentTrack = await track.getMetaAsync()
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

server
  .get('/stream', (req, res) => {
    // @ts-ignore
    station.connectListener(req, res)
  })

server
  .get('/info', (req, res) => {
    res.json(currentTrack)
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
  .use('/', sirv('web/dist'))
  .listen(port, host, () => {
    station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle())
    station.start()
    console.log(`Server started at http://${host}:${port}`)
  })

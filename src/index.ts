import sirv from 'sirv'
import { App } from '@tinyhttp/app'
import { Station, PUBLIC_EVENTS, SHUFFLE_METHODS } from '@fridgefm/radio-core'
import type { ShallowTrackMeta } from '@fridgefm/radio-core/lib/base/Track/Track.types'

const server = new App()
const music = new URL('../music', import.meta.url).pathname.substring(1)
let currentTrack: ShallowTrackMeta

const station = new Station({ verbose: true })
station.on(PUBLIC_EVENTS.ERROR, console.error)
station.addFolder(music)

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

server
  .get('/stream', (req, res) => {
    // TODO: patch http2 types
    // @ts-ignore
    station.connectListener(req, res)
  })

server
  .get('/playing', (_, res) => {
    res.json(currentTrack)
  })

server
  .get('/controls/next', (_, res) => {
    station.next()
    res.json({
      message: 'Switched to next track'
    })
  })

server
  .get('/controls/shufflePlaylist', (_, res) => {
    station.reorderPlaylist(SHUFFLE_METHODS.randomShuffle())
    res.json({
      message: 'Playlist shuffled'
    })
  })

server
  .get('/controls/rearrangePlaylist', (req, res) => {
    const { newIndex, oldIndex } = req.query
    station.reorderPlaylist(
      SHUFFLE_METHODS.rearrange({
        from: Number(oldIndex),
        to: Number(newIndex)
      })
    )

    res.json({
      message: `Succesfully moved element from "${oldIndex}" to "${newIndex}"`
    })
  })

server
  .get('/controls/getPlaylist', (_, res) => {
    const plist = station.getPlaylist()
    res.json(plist)
  })

server
  .use('/', sirv('web'))
  .listen(3000, () => {
    station.start()
    console.log('Server started at http://localhost:3000')
  })

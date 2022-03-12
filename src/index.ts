import sirv from 'sirv'
import { App } from '@tinyhttp/app'
import { Radio } from './radio.js'
import { Logger } from './logger.js'

const isDev = process.env.NODE_ENV === 'development'

const stations = [
  'indie',
  'mashup',
  'trash'
] as const

type Stations = typeof stations[number]

const radio = new Radio<Stations>({
  musicFolder: './music',
  verbose: false,
  // @ts-ignore
  stations // WIP
})

const server = new App()
const PORT = 8000

server
  .use('/stream/:station', (req, res) => {
    try {
      const query = req.params['station'] as Stations
      const station = radio.getStation(query)
      // TODO: fix http2 types
      // @ts-ignore
      station.connectListener(req, res)
    } catch (error) {
      res.json({ error })
    }
  })

server
  .use('/playing/:station', (req, res) => {
    try {
      const query = req.params['station'] as Stations
      const currentTrack = radio.getTrackMeta(query)
      res.json(currentTrack)
    } catch (error) {
      res.json({ error })
    }
  })

server
  .use('/playlist/:station', (req, res) => {
    try {
      const query = req.params['station'] as Stations
      const playlist = radio.getPlaylist(query)
      res.json(playlist)
    } catch (error) {
      res.json({ error })
    }
  })

const webFolder = isDev ?
  'web/dist' :
  'web'

server
  .use('/', sirv(webFolder))
  .listen(PORT, () => {
    radio.start()
    Logger.info(`Server started at http://localhost:${PORT}`, 'server')
  })

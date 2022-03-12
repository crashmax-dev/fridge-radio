import sirv from 'sirv'
import { App } from '@tinyhttp/app'
import { Radio } from './radio.js'
import { Logger } from './logger.js'
import { stations, PORT } from './config.js'
import type { ClientRequest } from 'http'
import type { Request } from '@tinyhttp/app'

type Req = Request & ClientRequest

const radio = new Radio({
  musicFolder: './music',
  verbose: false,
  stations
})

const server = new App()

server
  .use('/stream/:station', (req, res) => {
    try {
      const query = req.params['station']!
      const station = radio.getStation(query)
      station.connectListener(req as Req, res)
    } catch (error) {
      res.json({ error })
    }
  })

server
  .use('/playing/:station', (req, res) => {
    try {
      const query = req.params['station']!
      const currentTrack = radio.getTrackMeta(query)
      res.json(currentTrack)
    } catch (error) {
      res.json({ error })
    }
  })

server
  .use('/playlist/:station', (req, res) => {
    try {
      const query = req.params['station']!
      const playlist = radio.getPlaylist(query)
      res.json(playlist)
    } catch (error) {
      res.json({ error })
    }
  })

server
  .use('/', sirv('web/dist'))
  .listen(PORT, () => {
    radio.start()
    Logger.info(`Server started at http://localhost:${PORT}`, 'server')
  })

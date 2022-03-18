import path from 'path'
import { Station, PUBLIC_EVENTS, SHUFFLE_METHODS } from '@fridgefm/radio-core'
import type { TrackList } from '@fridgefm/radio-core/lib/base/Playlist/Playlist.types'
import type { ShallowTrackMeta } from '@fridgefm/radio-core/lib/base/Track/Track.types'

interface RadioOptions<T> {
  stations: T[]
  musicFolder: string
  verbose?: boolean
}

const ERROR = {
  NOT_FOUND: 'Station not found',
  NOT_PLAYING: 'Station does not playing'
}

export class Radio<T extends string> {
  private musicFolder: string
  private stations: Record<T, Station>
  private nowPlaying: Record<T, ShallowTrackMeta>

  constructor({ stations, musicFolder, verbose }: RadioOptions<T>) {
    this.musicFolder = musicFolder
    this.stations = {} as Record<T, Station>
    this.nowPlaying = {} as Record<T, ShallowTrackMeta>

    stations.forEach((name) => {
      const station = new Station({
        verbose: verbose ?? false
      })

      const folder = path.join(this.musicFolder, name)
      station.addFolder(folder)

      station.on(PUBLIC_EVENTS.ERROR, console.error)

      station
        .on(PUBLIC_EVENTS.NEXT_TRACK, async (track) => {
          this.nowPlaying[name] = await track.getMetaAsync()
        })

      station
        .on(PUBLIC_EVENTS.START, () => {
          this.reorderPlaylist(name)
        })

      station
        .on(PUBLIC_EVENTS.RESTART, () => {
          this.reorderPlaylist(name)
        })

      station.on('einfo', (event) => {
        console.log(`[${name}]: ${event.message!}`)
      })

      station.on('enexttrack', async (event) => {
        const track = await event.getMetaAsync()
        console.log(`[${name}]: ${track.artist!} - ${track.title!}`)
      })

      station.on('error', (event) => {
        console.log(`[${name}]: ${event.message!}`)
      })

      this.stations[name] = station
    })
  }

  start(shuffle: boolean): void {
    for (const [name, station] of Object.entries<Station>(this.stations)) {
      if (shuffle) {
        this.shuffleStation(name as T)
      }

      station.start()
    }
  }

  next(name: T): void {
    this.stations[name].next()
  }

  getStation(name: T): Record<T, Station>[T] {
    const station = this.stations[name]

    if (!station) {
      throw ERROR.NOT_FOUND
    }

    return station
  }

  getTrackMeta(name: T): ShallowTrackMeta {
    const station = this.stations[name]
    if (!station) {
      throw ERROR.NOT_FOUND
    }

    const trackMeta = this.nowPlaying[name]
    if (!trackMeta) {
      throw ERROR.NOT_PLAYING
    }

    return trackMeta
  }

  getPlaylist(name: T): TrackList {
    const station = this.stations[name]
    if (!station) {
      throw ERROR.NOT_FOUND
    }

    return station.getPlaylist()
  }

  shuffleStation(name: T): void {
    this.stations[name]
      .reorderPlaylist(SHUFFLE_METHODS.randomShuffle())
  }

  reorderPlaylist(name: T): void {
    this.stations[name]
      .reorderPlaylist(playlist => playlist.concat(playlist))
  }
}

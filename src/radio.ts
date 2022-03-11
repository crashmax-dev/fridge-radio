import path from 'path'
import { Station, PUBLIC_EVENTS } from '@fridgefm/radio-core'
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

      this.stations[name] = station
    })
  }

  start(): void {
    Object.values(this.stations)
      .forEach((station) => {
        (station as Station).start()
      })
  }

  next(name: T): void {
    this.stations[name].next()
  }

  getStation(name: T): Record<T, Station>[T] {
    const station = this.stations[name]

    if (!name) {
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

  private reorderPlaylist(name: T): void {
    this.stations[name]
      .reorderPlaylist(playlist => playlist.concat(playlist))
  }
}

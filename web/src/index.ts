import { el, mount } from 'redom'
import type { ShallowTrackMeta } from '@fridgefm/radio-core/lib/base/Track/Track.types'
import { Player } from './player'

const player = new Player('http://localhost:8000/stream')
player.volume(0.1)

mount(document.body, player.el)

// interface ImageBuffer {
//   imageBuffer: {
//     data: Iterable<number>
//   }
// }

// let currentTrack: ShallowTrackMeta
// const stream = new EventSource('http://localhost:8000/current')
// stream.addEventListener('message', (event) => {
//   currentTrack = JSON.parse(event.data) as ShallowTrackMeta
//   cover.src = getCoverUrl(currentTrack.image as unknown as ImageBuffer)
// })

// const cover = el('img', {
//   style: {
//     width: '200px',
//     height: '200px',
//     borderRadius: '20px'
//   },
//   src: 'https://t3.ftcdn.net/jpg/01/09/40/34/240_F_109403479_3BJH2QY7zrMV5OUGPePPmxPYZf0zY4lR.jpg'
// })

// const audio = el('audio', {
//   controls: true,
//   src: 'http://localhost:8000/stream',
//   type: 'audio/mp3'
// }) as HTMLAudioElement

// audio.addEventListener('ended', (event) => {
//   console.log(event)
// })

// audio.volume = 0.1

// const playButton = el('button', {
//   onclick: () => {
//     if (audio.played) {
//       audio.play()
//       playButton.textContent = 'Stop'
//     } else {
//       audio.pause()
//       playButton.textContent = 'Play'
//     }
//   }
// }, 'Play')


// async function nowPlaying(): Promise<void> {
//   const response = await fetch('/info')
//   const data = await response.json() as ShallowTrackMeta
//   console.log(data)
// }

// const getCoverUrl = (image = {} as ImageBuffer): string => {
//   const imageBuffer = image.imageBuffer

//   if (!imageBuffer) {
//     return 'https://t3.ftcdn.net/jpg/01/09/40/34/240_F_109403479_3BJH2QY7zrMV5OUGPePPmxPYZf0zY4lR.jpg'
//   }

//   const blob = new Blob([new Uint8Array(imageBuffer.data)])
//   return URL.createObjectURL(blob)
// }

// document.body.appendChild(audio)
// document.body.appendChild(cover)
// document.body.appendChild(playButton)
// // nowPlaying()

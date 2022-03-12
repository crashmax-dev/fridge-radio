import { el } from 'redom'

const player = el('audio', {
  controls: true,
  src: '/stream/indie',
  type: 'audio/mp3'
})

document.body.appendChild(player)

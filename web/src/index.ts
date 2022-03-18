import { el } from 'redom'

const player = el('audio', {
  controls: true,
  src: '/stream',
  type: 'audio/mp3'
})

document.body.appendChild(player)

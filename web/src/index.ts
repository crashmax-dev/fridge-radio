import { el } from 'redom'
import config from '../../config.json'

const player = el('audio', {
  controls: true,
  src: '/stream/indie',
  type: 'audio/mp3'
})

document.body.appendChild(player)

console.log(config)

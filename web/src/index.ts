import { el } from 'redom'
// @ts-ignore
import config from '../../radio.config'
console.log(config)

for (const station of config.stations) {
  const player = el('audio', {
    controls: true,
    src: `/stream/${station}`,
    type: 'audio/mp3'
  })

  document.body.appendChild(player)
}

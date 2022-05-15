import { el, mount } from 'redom'
import type { RedomComponent } from 'redom'

export class Player implements RedomComponent {
  readonly el: HTMLDivElement

  private audio: HTMLAudioElement
  private button: HTMLButtonElement

  constructor(src: string) {
    this.audio = el('audio', {
      src,
      type: 'audio/mp3'
    }) as HTMLAudioElement

    this.audio.addEventListener('ended', (event) => {
      console.log(event)
    })

    this.button = el('button', {
      onclick: () => {
        if (this.audio.played) {
          this.stop()
        } else {
          this.play()
        }
      }
    }, 'Play')

    this.el = el('div', [
      this.audio,
      this.button
    ])
  }

  play(): void {
    this.audio.play()
    this.button.textContent = 'Stop'
  }

  stop(): void {
    this.audio.pause()
    this.button.textContent = 'Play'
  }

  volume(value: number): void {
    this.audio.volume = value
  }
}

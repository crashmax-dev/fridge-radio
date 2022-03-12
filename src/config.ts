import { readFile } from 'node:fs/promises'

interface Config {
  port: number
  stations: string[]
}

const { port, stations } = JSON.parse(
  await readFile(
    new URL('../config.json', import.meta.url)
  ) as unknown as string
) as Config

export { port, stations }

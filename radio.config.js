export default {
  host: process.env.APP_IP ?? 'localhost',
  port: process.env.APP_PORT ?? 8000,
  stations: [
    'any'
  ]
}

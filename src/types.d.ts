declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_IP: string
      APP_PORT: number
      NODE_ENV: 'development' | 'production'
    }
  }
}

export {}

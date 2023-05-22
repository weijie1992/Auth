import Redis from 'ioredis'

let redisClient

const initRedis = async () => {
  if (redisClient) {
    console.log('Redis is already connected')
    return redisClient
  }
  redisClient = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    retryStrategy(numOfRetries) {
      console.log('Current retry number is : ', numOfRetries)
      const delay = Math.min(numOfRetries * 50, 2000)
      return delay
    },
  })

  redisClient.on('connect', () => {
    console.log('Redis is connected')
  })
  redisClient.on('error', (error) => {
    console.log('Error connecting to Redis', error)
  })

  return redisClient
}

export default initRedis
export { redisClient }

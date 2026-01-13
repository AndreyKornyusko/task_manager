import mongoose from 'mongoose'
import { migrateDataFromJson } from './migrate'

const MONGODB_URI = process.env.MONGO_URL

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URL environment variable inside .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  migrated: boolean
}

// Global cache for mongoose connection
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null, migrated: false }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    // Run migration once after connection is established
    if (!cached.migrated) {
      try {
        await migrateDataFromJson()
        cached.migrated = true
      } catch (error) {
        cached.migrated = true // Mark as migrated to prevent retries
      }
    }
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then(async (mongoose) => {
      // Run migration once after connection is established
      if (!cached.migrated) {
        try {
          await migrateDataFromJson()
          cached.migrated = true
        } catch (error) {
          cached.migrated = true // Mark as migrated to prevent retries
        }
      }
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB


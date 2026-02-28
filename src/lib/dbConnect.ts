import mongoose from "mongoose";

declare global {
    var mongoose: any; // eslint-disable-line no-var
}

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    // 1. If connection exists, return it immediately
    if (cached.conn) return cached.conn;

    // 2. If no promise exists, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // These options help with serverless timeouts
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    // 3. Await the promise and cache the result
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        // If connection fails, clear the promise so it can retry next time
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
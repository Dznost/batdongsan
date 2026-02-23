const mongoose = require('mongoose');

// Database configuration
const dbConfig = {
    development: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bat_dong_san',
        options: {
            // Remove deprecated options
            // useNewUrlParser and useUnifiedTopology are no longer needed in newer versions
        }
    },
    production: {
        uri: process.env.MONGODB_URI,
        options: {
            // Production specific options
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferMaxEntries: 0, // Disable mongoose buffering
            bufferCommands: false, // Disable mongoose buffering
        }
    },
    test: {
        uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/bat_dong_san_test',
        options: {}
    }
};


const env = process.env.NODE_ENV || 'development';
const currentConfig = dbConfig[env];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(currentConfig.uri, currentConfig.options);
        
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🌍 Environment: ${env}`);
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('🔌 MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
        
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('🔌 MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });
        
        return conn;
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB disconnected');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
    }
};

const isConnected = () => {
    return mongoose.connection.readyState === 1;
};

const getConnectionInfo = () => {
    const conn = mongoose.connection;
    return {
        readyState: conn.readyState,
        host: conn.host,
        port: conn.port,
        name: conn.name,
        collections: Object.keys(conn.collections)
    };
};

const healthCheck = async () => {
    try {
        if (!isConnected()) {
            throw new Error('Database not connected');
        }
        
        await mongoose.connection.db.admin().ping();
        
        return {
            status: 'healthy',
            timestamp: new Date(),
            info: getConnectionInfo()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date(),
            error: error.message
        };
    }
};

module.exports = {
    connectDB,
    disconnectDB,
    isConnected,
    getConnectionInfo,
    healthCheck,
    dbConfig
};

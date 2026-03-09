const mongoose = require('mongoose');

// Database configuration
const dbConfig = {
    development: {
        // Ưu tiên kết nối online qua biến môi trường. Nếu không có, mới dùng localhost dự phòng.
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bat_dong_san',
        options: {
            serverSelectionTimeoutMS: 10000, // Cập nhật thời gian chờ theo bản online mẫu của bạn
        }
    },
    production: {
        // Trên môi trường Render, BẮT BUỘC phải lấy link từ biến môi trường
        uri: process.env.MONGODB_URI,
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // Cập nhật thời gian chờ
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false,
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
        // Báo lỗi ngay nếu đang ở production (như trên Render) mà quên nhập MONGODB_URI
        if (!currentConfig.uri) {
            throw new Error('MONGODB_URI is not defined in the environment variables.');
        }

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
        console.error('❌ MongoDB connection failed:', error.message);
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

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🛡️ ¡Conexión exitosa a MongoDB!');
    } catch (error) {
        console.error('❌ Error crítico al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
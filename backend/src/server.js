require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

console.log("⏳ Intentando conectar a la base de datos..."); // <- Agrega esta línea

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Servidor de Knight of Hope corriendo en http://localhost:${PORT}`);
    });
});
const express = require('express');

const app = express();

// Middlewares
app.use(express.json());

// Rutas base
app.get('/', (req, res) => {
    res.send('¡Backend de Knight of Hope configurado correctamente!');
});

// Exportamos la app, NO usamos app.listen aquí
module.exports = app;
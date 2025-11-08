const express = require('express');
const cors = require('cors');
const app = express();

// --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
// La URL de tu Frontend en Vercel. Debe ser HTTPS y SIN barra diagonal final.
const allowedOrigins = ['https://ccsmexico.vercel.app'];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes del origen listado (Vercel)
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            // Rechazar cualquier otro dominio (seguridad)
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); 

// Simulación de Base de Datos en Memoria
const database = new Map(); 

// --- ENDPOINT UNIFICADO DE AUTENTICACIÓN (/api/auth) ---
app.post('/api/auth', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y clave son requeridos.' });
    }

    const user = database.get(email);

    if (user) {
        // CASO 1: LOGIN (Usuario Existe)
        if (user.password === password) {
            console.log(`✅ LOGIN exitoso para: ${email}`);
            return res.status(200).json({
                message: 'Inicio de sesión exitoso.',
                token: 'mock-token-' + Math.random().toString(36).substring(7),
                balance: user.balance 
            });
        } else {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }
    } else {
        // CASO 2: REGISTRO AUTOMÁTICO (Usuario Nuevo)
        if (password.length < 4) {
             return res.status(400).json({ message: 'La clave debe tener al menos 4 caracteres.' });
        }
        
        const newUser = { password, balance: 500.00 }; // Saldo inicial para prueba
        database.set(email, newUser);
        
        console.log(`✨ REGISTRO exitoso para: ${email}`);
        return res.status(200).json({
            message: 'Registro exitoso. Sesión iniciada.',
            token: 'mock-token-' + Math.random().toString(36).substring(7),
            balance: newUser.balance
        });
    }
});


// --- OTROS ENDPOINTS (Mantenidos Simples) ---

app.get('/api/balance', (req, res) => {
    // Si la DB está vacía, devuelve un saldo por defecto para que no falle la conexión.
    return res.status(200).json({ balance: 500.00 }); 
});

app.post('/api/recharge', (req, res) => {
    const newBalance = 10000.00; 
    return res.status(200).json({ 
        newBalance: newBalance,
        message: 'Recarga procesada.' 
    });
});

app.post('/api/purchase', (req, res) => {
    const cost = req.body.cost || 100;
    const currentBalance = 10000; 
    const newBalance = currentBalance - cost;

    return res.status(200).json({
        newBalance: newBalance,
        message: 'Compra exitosa. Datos enviados por correo.'
    });
});

// Endpoint de prueba (Ruta raíz)
app.get('/', (req, res) => {
    res.send('Servidor de Backend para CCSMEXICO está activo. Usa /api/auth para las peticiones.');
});


// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Servidor de Backend funcionando en el puerto ${PORT}`);
});

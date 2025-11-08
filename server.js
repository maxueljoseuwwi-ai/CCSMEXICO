const express = require('express');
const cors = require('cors');
const app = express();

// --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
// Permitir solicitudes SÓLO desde tu Frontend alojado en Vercel
const allowedOrigins = ['https://ccsmexico.vercel.app'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Middleware para leer JSON en las peticiones

// Simulación de Base de Datos en Memoria (Los datos se borrarán si el servidor se reinicia)
// Para un proyecto REAL, usarías PostgreSQL/MongoDB aquí.
const database = new Map(); 

// --- ENDPOINT UNIFICADO DE AUTENTICACIÓN (/api/auth) ---
app.post('/api/auth', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y clave son requeridos.' });
    }

    const user = database.get(email);

    if (user) {
        // --- CASO 1: LOGIN (Usuario Existe) ---
        if (user.password === password) {
            console.log(`✅ LOGIN exitoso para: ${email}`);
            return res.status(200).json({
                message: 'Inicio de sesión exitoso.',
                // Token simulado (El token real debería ser JWT)
                token: 'mock-token-' + Math.random().toString(36).substring(7),
                balance: user.balance // Devuelve el saldo guardado
            });
        } else {
            // Clave incorrecta
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }
    } else {
        // --- CASO 2: REGISTRO AUTOMÁTICO (Usuario Nuevo) ---
        if (password.length < 4) {
             return res.status(400).json({ message: 'La clave debe tener al menos 4 caracteres.' });
        }
        
        const newUser = { password, balance: 0.00 }; // Saldo inicial: Cero
        database.set(email, newUser);
        
        console.log(`✨ REGISTRO exitoso para: ${email}`);
        return res.status(200).json({
            message: 'Registro exitoso. Sesión iniciada.',
            token: 'mock-token-' + Math.random().toString(36).substring(7),
            balance: newUser.balance
        });
    }
});


// --- ENDPOINTS DE SALDO Y RECARGA ---

// Endpoint para obtener el saldo (necesario al recargar la página)
app.get('/api/balance', (req, res) => {
    // Aquí, se debería usar el token del header para identificar al usuario
    // Por simplicidad, asumiremos que el usuario existe y devolveremos un valor
    return res.status(200).json({ balance: 500.00 }); 
});

// Endpoint para recargar saldo (simulado)
app.post('/api/recharge', (req, res) => {
    // Si la recarga siempre es 10000, simulamos que el saldo aumenta.
    // En un caso real, esto actualizaría la DB.
    
    // NOTA: Para que esto afecte al LOGIN, debes implementar la lógica de actualización en el Map
    // Por ahora, solo simula el ÉXITO para que el Frontend se actualice.
    const newBalance = 10000.00; // Simula un nuevo saldo después de la recarga
    return res.status(200).json({ 
        newBalance: newBalance,
        message: 'Recarga procesada.' 
    });
});

// Endpoint de compra (simulado)
app.post('/api/purchase', (req, res) => {
    // Lógica para descontar el costo y enviar los datos de la tarjeta.
    // Simplemente devolvemos un saldo menor simulado para que el Frontend continúe.
    const cost = req.body.cost || 100;
    const currentBalance = 10000; // Asumir que tiene saldo
    const newBalance = currentBalance - cost;

    return res.status(200).json({
        newBalance: newBalance,
        message: 'Compra exitosa. Datos enviados por correo.'
    });
});

// Endpoint de prueba (Ruta raíz para saber que el servidor está despierto)
app.get('/', (req, res) => {
    res.send('Servidor de Backend para CCSMEXICO está activo. Usa /api/auth para las peticiones.');
});


// --- INICIO DEL SERVIDOR ---
// Render usa la variable de entorno PORT para saber en qué puerto debe escuchar.
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
    console.log(`Servidor de Backend funcionando en el puerto ${PORT}`);
});
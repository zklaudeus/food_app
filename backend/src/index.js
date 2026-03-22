const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})


app.use('/api/productos', require('./routes/productos'))
app.use('/api/ingredientes', require('./routes/ingredientes'))
app.use('/api/producto_ingredientes',require('./routes/producto_ingredientes'))

// Autenticación
app.use('/api/auth', require('./routes/auth'))

// Rutas protegidas
app.use('/api/pedidos', require('./routes/pedidos'))

const server = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso`)
  } else {
    console.error('❌ Error al iniciar el servidor:', error.message)
  }
})


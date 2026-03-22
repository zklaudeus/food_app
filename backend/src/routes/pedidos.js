// routes/pedidos.js
const router = require('express').Router()
const { createPedidos, getPedidos, getPedidosById, actualizarEstadoPedido, eliminarPedidoById, getResumenPedidos, getHistorialPedidos } = require('../controllers/pedidos')

const { verificarToken } = require('../middlewares/auth')

router.post('/', createPedidos)
router.get('/', verificarToken, getPedidos)
router.get('/resumen', verificarToken, getResumenPedidos)
router.get('/historial', verificarToken, getHistorialPedidos)
router.get('/:id', verificarToken, getPedidosById)
router.patch('/:id', verificarToken, actualizarEstadoPedido)
router.delete('/:id', verificarToken, eliminarPedidoById)

module.exports = router
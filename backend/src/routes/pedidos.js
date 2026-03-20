// routes/pedidos.js
const router = require('express').Router()
const { createPedidos, getPedidos, getPedidosById, actualizarEstadoPedido, eliminarPedidoById } = require('../controllers/pedidos')

router.post('/', createPedidos)
router.get('/',getPedidos)
router.get('/:id',getPedidosById)
router.patch('/:id',actualizarEstadoPedido)
router.delete('/:id',eliminarPedidoById)

module.exports = router
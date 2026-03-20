const router = require('express').Router()
const { getProductos,createProducto, getProductoById, actualizarProductoById,eliminarProductoById} = require('../controllers/productos')

router.get('/', getProductos)
router.post('/', createProducto) 
router.get('/:id',getProductoById)
router.put('/:id',actualizarProductoById)
router.delete('/:id',eliminarProductoById)

module.exports = router 
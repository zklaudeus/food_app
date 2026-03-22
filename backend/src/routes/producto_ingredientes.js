const router = require('express').Router()
const {getAllProductoIngredientes, getProductoIngredientes ,createProductoIngredientes,eliminarProductoIngredientesById} = require('../controllers/producto_ingredientes')


router.get('/', getAllProductoIngredientes)
router.get('/:producto_id', getProductoIngredientes)

router.post('/', createProductoIngredientes)

router.delete('/:id', eliminarProductoIngredientesById)

module.exports = router 
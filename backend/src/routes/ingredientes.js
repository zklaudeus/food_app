const router = require('express').Router()
const {getIngredientes, getIngredientesByiD, createIngredientes,actualizarIngredientesById, eliminarIngredientesById} = require('../controllers/ingredientes')

router.get('/', getIngredientes)
router.get('/:id', getIngredientesByiD)
router.post('/', createIngredientes)
router.put('/:id', actualizarIngredientesById)
router.delete('/:id', eliminarIngredientesById)

module.exports = router 
const pool = require('../db')

const getProductoIngredientes = async (req, res) => {
    try {
        const { producto_id } = req.params
        const result = await pool.query(
    `SELECT pi.id, pi.es_default, i.nombre, i.precio_extra, i.tipo 
 FROM producto_ingredientes pi
 JOIN ingredientes i ON i.id = pi.ingrediente_id
 WHERE pi.producto_id = $1`,
    [producto_id]
)
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener producto_ingredientes' })
    }
}

//Crear producto mas el ingrediente
const createProductoIngredientes = async (req, res) => {
    try {
        const { producto_id, ingrediente_id, es_default } = req.body

        const existe = await pool.query(
            'SELECT * FROM producto_ingredientes WHERE producto_id = $1 AND ingrediente_id = $2',
            [producto_id, ingrediente_id]
        )

        if (existe.rows[0]) {
            return res.status(409).json({ error: 'Ya existe el ingrediente en tu plato' })
        }

        const result = await pool.query(
            'INSERT INTO producto_ingredientes (producto_id, ingrediente_id, es_default) VALUES ($1, $2, $3) RETURNING *',
            [producto_id, ingrediente_id, es_default ?? false]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al crear producto_ingrediente' })
    }
}


//eliminar productos
const eliminarProductoIngredientesById = async(req,res) =>{
    try{
        const {id} = req.params
        const result = await pool.query(
            'DELETE FROM producto_ingredientes WHERE id = $1 RETURNING *',
            [id]
        )
        if (!result.rows[0]){
            return res.status(404).json({error:'Producto_Ingredientes no encontrado, no eliminado'})
        }res.json(result.rows[0])
    }catch (err){
        console.error(err)
        res.status(500).json({error:'Error al eliminar el producto_ingredientes'})
    }
}

module.exports = {getProductoIngredientes,createProductoIngredientes,eliminarProductoIngredientesById}
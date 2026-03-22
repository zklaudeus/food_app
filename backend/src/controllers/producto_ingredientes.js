const pool = require('../db')

//obtener todos los producto_ingredientes
const getAllProductoIngredientes = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pi.id, pi.es_default, 
                    pb.nombre as producto_nombre,
                    i.nombre as ingrediente_nombre, 
                    i.precio_extra, 
                    i.tipo
             FROM producto_ingredientes pi
             JOIN producto_base pb ON pb.id = pi.producto_id
             JOIN ingredientes i ON i.id = pi.ingrediente_id
             ORDER BY pb.nombre`
        )
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener todos los producto_ingredientes' })
    }
}

const getProductoIngredientes = async (req, res) => {
    try {
        const { producto_id } = req.params

        // [MODIFICADO] Verificación de existencia de producto_id
        if (!producto_id) {
            return res.status(400).json({ error: 'El id del producto es obligatorio para obtener sus ingredientes' })
        }

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

        // [MODIFICADO] Se valida que los ids necesarios para hacer la relación existan
        if (!producto_id || !ingrediente_id) {
            return res.status(400).json({ error: 'Los campos producto_id e ingrediente_id son obligatorios' })
        }

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

        // [MODIFICADO] Se valida que el id haya sido proporcionado antes de eliminar
        if (!id) {
            return res.status(400).json({ error: 'El id es requerido para eliminar la relación' })
        }

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

module.exports = {getAllProductoIngredientes, getProductoIngredientes,createProductoIngredientes,eliminarProductoIngredientesById}
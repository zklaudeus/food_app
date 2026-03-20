const pool = require('../db')

//obtener ingredientes *
const getIngredientes = async (req, res) => {
    try {
        const ingredientes = await pool.query('SELECT * FROM ingredientes')
        res.json({ ingredientes: ingredientes.rows })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener ingredientes' })
    }
}

//obtener ingredientes por id

const getIngredientesByiD = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query('SELECT * FROM ingredientes where id = $1', [id])
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Ingrediente no encontrado' })
        }
        res.json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener ingredientes' })
    }
}

//Crear ingrediente
const createIngredientes = async (req, res) => {
    try {
        const { nombre, precio_extra, tipo } = req.body

        // 1. verificar si ya existe
        const existe = await pool.query(
            'SELECT * FROM ingredientes WHERE nombre = $1',
            [nombre]
        )

        // 2. si existe responde 409
        if (existe.rows[0]) {
            console.log('El ingrediente ya existe')
            return res.status(409).json({ error: 'El ingrediente ya existe' })
        }

        // 3. si no existe, crear
        const result = await pool.query(
            'INSERT INTO ingredientes (nombre, precio_extra, tipo) VALUES ($1, $2, $3) RETURNING *',
            [nombre, precio_extra, tipo]
        )
        res.status(201).json(result.rows[0])
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al crear ingrediente' })
    }
}

//actualizar ingredientes
const actualizarIngredientesById = async (req,res) =>{
    try{
        const {id} = req.params
        const{nombre,precio_extra,tipo} = req.body
        const result = await pool.query(
            'UPDATE ingredientes SET nombre = $1, precio_extra = $2, tipo = $3 WHERE id = $4 RETURNING *',[nombre, precio_extra, tipo, id]
        )
        if (!result.rows[0]){
            return res.status(404).json({error:'Ingredientes no encontrado'})
        }res.json(result.rows[0])
    } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar ingredientes' })
  }
}

//eliminar productos
const eliminarIngredientesById = async(req,res) =>{
    try{
        const {id} = req.params
        const result = await pool.query(
            'DELETE FROM ingredientes WHERE id = $1 RETURNING *',
            [id]
        )
        if (!result.rows[0]){
            return res.status(404).json({error:'Ingredientes no encontrado, no eliminado'})
        }res.json(result.rows[0])
    }catch (err){
        console.error(err)
        res.status(500).json({error:'Error al eliminar el ingredientes'})
    }
}


module.exports = { getIngredientes, getIngredientesByiD, createIngredientes,actualizarIngredientesById, eliminarIngredientesById }
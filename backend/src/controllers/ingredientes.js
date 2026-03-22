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

        // [MODIFICADO] Validación para asegurar que el id fue proporcionado
        if (!id) {
            return res.status(400).json({ error: 'El id del ingrediente es requerido' })
        }

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

        // [MODIFICADO] Validación para evitar crear un ingrediente con datos incompletos o nulos
        if (!nombre || precio_extra === undefined || !tipo) {
            return res.status(400).json({ error: 'Los campos nombre, precio_extra y tipo son requeridos' })
        }

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

        // [MODIFICADO] Se valida que el id y los campos a actualizar no estén vacíos
        if (!id) {
            return res.status(400).json({ error: 'El id del ingrediente es requerido para actualizar' })
        }
        if (!nombre || precio_extra === undefined || !tipo) {
            return res.status(400).json({ error: 'Los campos nombre, precio_extra y tipo no pueden estar vacíos' })
        }

        // [MODIFICADO] Verificar si el nuevo nombre ya le pertenece a otro ingrediente distinto
        const existe = await pool.query(
            'SELECT * FROM ingredientes WHERE nombre = $1 AND id != $2',
            [nombre, id]
        )
        if (existe.rows[0]) {
            return res.status(409).json({ error: 'Ya existe otro ingrediente con ese nombre' })
        }

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

        // [MODIFICADO] Se valida la existencia del id antes de intentar eliminar
        if (!id) {
            return res.status(400).json({ error: 'El id del ingrediente es requerido para eliminar' })
        }
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
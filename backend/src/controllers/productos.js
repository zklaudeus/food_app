//require, requerimos de la base de datos para obtener los datos
const pool = require('../db')


//Ademas obtenemos los datos con la cosntante getProductos la cual tiene que esperar la respuesta async/await
//el async va en la funcion que contenga await
//Ademas usamos try/catch para evitar caidas de el servidor
const getProductos = async (req, res) => {
  try {
    //Hace la query a la base de datos, este es el codigo que puede fallar
    const productos = await pool.query('SELECT * FROM producto_base WHERE activo = true')

    const productosConIngredientes = await Promise.all(
      productos.rows.map(async (producto) => {
        const ingredientes = await pool.query(
          `SELECT i.* FROM ingredientes i
           JOIN producto_ingredientes pi ON i.id = pi.ingrediente_id
           WHERE pi.producto_id = $1`,
          [producto.id]
        )
        return { ...producto, ingredientes: ingredientes.rows }
      })
    )
//respuesta
    console.log(`Productos obtenidos correctamente, Cantidad: ${productos.rows.length}`)
    res.json(productosConIngredientes)
  } catch (err) {
    //si algo falla llega aqui y arroja el error 500
    console.error(err)
    res.status(500).json({ error: 'Error al obtener productos' })
  }
}

//Obtener producto por id
const getProductoById = async (req, res) => {
  try {
    // el id viene de la URL → /api/productos/5 los cuales usa req ya que es lo que el cliente manda
    const { id } = req.params

    // [MODIFICADO] Validación para garantizar que el ID no esté vacío
    if (!id) {
      return res.status(400).json({ error: 'El id del producto es requerido' })
    }

    // busca el producto
    const result = await pool.query(
      'SELECT * FROM producto_base WHERE id = $1',
      [id]
    )

    // si no existe responde 404
    if (!result.rows[0]) {
      //res es la respuesta que entrega el servidor al cliente en base a su consulta
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    const producto = result.rows[0]

    // busca sus ingredientes
    const ingredientes = await pool.query(
      `SELECT i.* FROM ingredientes i
       JOIN producto_ingredientes pi ON i.id = pi.ingrediente_id
       WHERE pi.producto_id = $1`,
      [id]
    )

    // responde con el producto y sus ingredientes juntos
    res.json({ ...producto, ingredientes: ingredientes.rows })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener producto' })
  }
}

//crear producto
const createProducto = async (req,res) =>{
    try{
        const{nombre,precio_base,tipo} = req.body

        // [MODIFICADO] Se valida la presencia de los campos requeridos para crear el producto
        if (!nombre || precio_base === undefined || !tipo) {
            return res.status(400).json({ error: 'Los campos nombre, precio_base y tipo son obligatorios' })
        }

        // 1. verificar si ya existe
        const existe = await pool.query(
            'SELECT * FROM producto_base WHERE nombre = $1',
            [nombre]
        )

        // 2. si existe responde 409
        if (existe.rows[0]) {
            console.log('El producto ya existe')
            return res.status(409).json({ error: 'EL producto ya existe' })
        }
        const result = await pool.query(
            'INSERT INTO producto_base (nombre, precio_base, tipo) VALUES ($1, $2, $3) RETURNING *',
            [nombre, precio_base, tipo]
        )
        res.status(201).json(result.rows[0])
    }catch (err){
        console.error(err)
        res.status(500).json({ error: 'Error al crear producto' })
    }
}

//actualizar producto por id
const actualizarProductoById = async (req,res) =>{
    try{
        const {id} = req.params
        const{nombre,precio_base,tipo} = req.body

        // [MODIFICADO] Se requiere que el id y los campos a actualizar estén presentes
        if (!id) {
            return res.status(400).json({ error: 'El id del producto es requerido para actualizar' })
        }
        if (!nombre || precio_base === undefined || !tipo) {
            return res.status(400).json({ error: 'Los campos nombre, precio_base y tipo no pueden estar vacíos' })
        }

        // [MODIFICADO] Verificar si el nuevo nombre ya le pertenece a otro producto distinto
        const existe = await pool.query(
            'SELECT * FROM producto_base WHERE nombre = $1 AND id != $2',
            [nombre, id]
        )
        if (existe.rows[0]) {
            return res.status(409).json({ error: 'Ya existe otro producto con ese nombre' })
        }

        const result = await pool.query(
            'UPDATE producto_base SET nombre = $1, precio_base = $2, tipo = $3 WHERE id = $4 RETURNING *',[nombre, precio_base, tipo, id]
        )
        if (!result.rows[0]){
            return res.status(404).json({error:'Producto no encontrado'})
        }res.json(result.rows[0])
    } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
}

//eliminar producto por id
const eliminarProductoById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'El id del producto es requerido para eliminar' })
        }

        // 1. desvincular de producto_ingredientes
        await pool.query('DELETE FROM producto_ingredientes WHERE producto_id = $1', [id])

        // 2. eliminar el producto
        const result = await pool.query(
            'DELETE FROM producto_base WHERE id = $1 RETURNING *',
            [id]
        )

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        res.json(result.rows[0])

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al eliminar el producto' })
    }
}

module.exports = { getProductos,getProductoById, createProducto, actualizarProductoById,eliminarProductoById }
const pool = require('../db')

const createPedidos = async (req, res) => {
  try {
    const { nombre_cliente, telefono, total, items } = req.body

    // 1. insertar en pedido
    const pedidos = await pool.query(
      'INSERT INTO pedido (nombre_cliente, telefono, total) VALUES ($1, $2, $3) RETURNING *',
      [nombre_cliente, telefono, total]
    )

    const pedido_id = pedidos.rows[0].id


    for (const item of items) {
  const detalle = await pool.query(
    'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, subtotal) VALUES ($1, $2, $3, $4) RETURNING *',
    [pedido_id, item.producto_id, item.cantidad, item.subtotal]
  )

        const detalle_pedido_id = detalle.rows[0].id

      for (const ingrediente of item.ingredientes) {
    await pool.query(
      'INSERT INTO detalle_ingredientes (detalle_pedido_id, ingrediente_id, tipo, precio) VALUES ($1, $2, $3, $4)',
      [detalle_pedido_id, ingrediente.ingrediente_id, ingrediente.tipo, ingrediente.precio]
    )
  }
}

    // 4. responder con el pedido creado
    res.status(201).json(pedidos.rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'No se logro crear tu pedido' })
  }
}

//mostrar pedidos
const getPedidos = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pedido')
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener pedidos' })
    }
}


//pedido por id
const getPedidosById = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query('SELECT * FROM pedido WHERE id = $1', [id])
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        // 2. obtener detalles con nombre del producto
        const detalles = await pool.query(
            `SELECT dp.id, dp.pedido_id, dp.cantidad, dp.subtotal, pb.nombre as producto_nombre
             FROM detalle_pedido dp
             JOIN producto_base pb ON pb.id = dp.producto_id
             WHERE dp.pedido_id = $1`,
            [id]
        )

        // 3. por cada detalle obtener sus ingredientes con nombre
        const itemsConIngredientes = await Promise.all(
            detalles.rows.map(async (detalle) => {
                const ingredientes = await pool.query(
                    `SELECT di.id, di.tipo, di.precio, i.nombre
                     FROM detalle_ingredientes di
                     JOIN ingredientes i ON i.id = di.ingrediente_id
                     WHERE di.detalle_pedido_id = $1`,
                    [detalle.id]
                )
                return { ...detalle, ingredientes: ingredientes.rows }
            })
        )

        res.json({
            ...result.rows[0],
            items: itemsConIngredientes
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al obtener pedido' })
    }
}

//actualizar pedido
const actualizarEstadoPedido = async (req, res) => {
    try {
        const { id } = req.params
        const { estado } = req.body

        const result = await pool.query(
            'UPDATE pedido SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        )

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        res.json(result.rows[0])

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al actualizar estado' })
    }
}

//eliminar producto
const eliminarPedidoById = async(req,res) =>{
    try{
        const {id} = req.params
        const result = await pool.query(
            'DELETE FROM pedido WHERE id = $1 RETURNING *',
            [id]
        )
        if (!result.rows[0]){
            return res.status(404).json({error:'Pedido no encontrado, no eliminado'})
        }res.json(result.rows[0])
    }catch (err){
        console.error(err)
        res.status(500).json({error:'Error al eliminar el pedido'})
    }
}

module.exports = { createPedidos,getPedidos,getPedidosById,actualizarEstadoPedido,eliminarPedidoById}
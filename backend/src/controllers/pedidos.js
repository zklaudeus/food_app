const pool = require('../db')

// Obtener resumen para el dashboard (TOTALES Y VENTAS DEL DIA)
const getResumenPedidos = async (req, res) => {
    try {
        // Pedidos del dia por estado
        const estadoResult = await pool.query(`
            SELECT estado, COUNT(*) as cantidad 
            FROM pedido 
            WHERE DATE(fecha) = CURRENT_DATE 
            GROUP BY estado
        `)

        // Total vendido hoy
        const ventasResult = await pool.query(`
            SELECT COALESCE(SUM(total), 0) as total_vendido 
            FROM pedido 
            WHERE DATE(fecha) = CURRENT_DATE AND estado != 'cancelado'
        `)

        res.json({
            estados: estadoResult.rows,
            total_vendido: parseFloat(ventasResult.rows[0].total_vendido)
        })
    } catch (err) {
        // En caso de que la columna se llame de otra forma (ej. created_at), capturaremos el error
        console.error("Error en resumenPedidos:", err)
        res.status(500).json({ error: 'Error al obtener resumen de pedidos' })
    }
}

// Obtener historial con filtros
const getHistorialPedidos = async (req, res) => {
    try {
        const { filtro } = req.query // 'hoy', 'semana', 'mes'
        let dateCondition = "DATE(fecha) = CURRENT_DATE"

        if (filtro === 'semana') {
            dateCondition = "fecha >= date_trunc('week', CURRENT_DATE)"
        } else if (filtro === 'mes') {
            dateCondition = "fecha >= date_trunc('month', CURRENT_DATE)"
        }

        const query = `
            SELECT id, nombre_cliente, telefono, total, fecha, estado 
            FROM pedido 
            WHERE estado = 'entregado' AND ${dateCondition}
            ORDER BY fecha DESC
        `
        const result = await pool.query(query)

        // Calcular totales
        const totalVendido = result.rows.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0)
        const totalPedidos = result.rows.length
        const promedio = totalPedidos > 0 ? (totalVendido / totalPedidos).toFixed(2) : 0

        res.json({
            pedidos: result.rows,
            resumen: {
                total_pedidos: totalPedidos,
                total_vendido: totalVendido,
                promedio_pedido: parseFloat(promedio)
            }
        })
    } catch (err) {
        console.error("Error en historialPedidos:", err)
        res.status(500).json({ error: 'Error al obtener historial de pedidos' })
    }
}



//crear pedido 
const createPedidos = async (req, res) => {
  try {
    // Ya no extraemos 'total', el backend lo calculará
    const { nombre_cliente, telefono, items } = req.body

    // [MODIFICADO] Validamos solo el cliente y los items
    if (!nombre_cliente || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Los campos nombre_cliente e items (como arreglo no vacío) son obligatorios' })
    }

    let totalCalculado = 0
    const itemsValidados = []

    // --- 1. VALIDACIÓN Y CÁLCULO DE PRECIOS EN EL BACKEND ---
    for (const item of items) {
      if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
        return res.status(400).json({ error: 'Cada item debe tener un producto_id válido y una cantidad mayor a 0' })
      }

      // Validar producto y obtener precio base
      const prodResult = await pool.query('SELECT precio_base, nombre FROM producto_base WHERE id = $1', [item.producto_id])
      if (prodResult.rows.length === 0) {
        return res.status(404).json({ error: `El producto con id ${item.producto_id} no existe` })
      }
      
      let subtotalItem = Number(prodResult.rows[0].precio_base)
      const ingredientesValidados = []

      // Validar ingredientes y sumar precios
      if (item.ingredientes && Array.isArray(item.ingredientes)) {
        for (const ing of item.ingredientes) {
          if (!ing.ingrediente_id || !ing.tipo) {
            return res.status(400).json({ error: 'Cada ingrediente debe especificar ingrediente_id y tipo' })
          }

          const ingResult = await pool.query('SELECT precio_extra FROM ingredientes WHERE id = $1', [ing.ingrediente_id])
          if (ingResult.rows.length === 0) {
            return res.status(404).json({ error: `El ingrediente con id ${ing.ingrediente_id} no existe` })
          }
          
          const precioExtra = Number(ingResult.rows[0].precio_extra)
          ingredientesValidados.push({
            ingrediente_id: ing.ingrediente_id,
            tipo: ing.tipo,
            precio: precioExtra // Precio real de la DB
          })
          
          subtotalItem += precioExtra
        }
      }

      const subtotalTotalCantidad = subtotalItem * item.cantidad
      totalCalculado += subtotalTotalCantidad

      itemsValidados.push({
        producto_id: item.producto_id,
        producto_nombre: prodResult.rows[0].nombre,
        cantidad: item.cantidad,
        subtotal: subtotalTotalCantidad,
        ingredientes: ingredientesValidados
      })
    }

    // --- 2. INSERCIÓN SEGURA CON DATOS CALCULADOS ---
    const pedidos = await pool.query(
      'INSERT INTO pedido (nombre_cliente, telefono, total) VALUES ($1, $2, $3) RETURNING *',
      [nombre_cliente, telefono, totalCalculado]
    )

    const pedido_id = pedidos.rows[0].id

    for (const item of itemsValidados) {
      const detalle = await pool.query(
  'INSERT INTO detalle_pedido (pedido_id, producto_id, producto_nombre, cantidad, subtotal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
  [pedido_id, item.producto_id, item.producto_nombre, item.cantidad, item.subtotal]
)

      const detalle_pedido_id = detalle.rows[0].id

      for (const ingrediente of item.ingredientes) {
        await pool.query(
          'INSERT INTO detalle_ingredientes (detalle_pedido_id, ingrediente_id, tipo, precio) VALUES ($1, $2, $3, $4)',
          [detalle_pedido_id, ingrediente.ingrediente_id, ingrediente.tipo, ingrediente.precio]
        )
      }
    }

    // 4. responder con el pedido creado y total actualizado
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

        // [MODIFICADO] Se valida que el id haya sido proporcionado en los parámetros
        if (!id) {
            return res.status(400).json({ error: 'El id del pedido es requerido' })
        }

        const result = await pool.query('SELECT * FROM pedido WHERE id = $1', [id])
        if (!result.rows[0]) {
            return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        // 2. obtener detalles con nombre del producto y producto_id
        const detalles = await pool.query(
            `SELECT dp.id, dp.pedido_id, dp.cantidad, dp.subtotal, pb.nombre as producto_nombre, dp.producto_id
             FROM detalle_pedido dp
             JOIN producto_base pb ON pb.id = dp.producto_id
             WHERE dp.pedido_id = $1`,
            [id]
        )

        // 3. por cada detalle obtener sus ingredientes base y los agregados
        const itemsConIngredientes = await Promise.all(
            detalles.rows.map(async (detalle) => {
                // Ingredientes del producto base
                const baseResult = await pool.query(
                    `SELECT pi.id, 'base' as tipo, 0 as precio, i.nombre || ' (Base)' as nombre
                     FROM producto_ingredientes pi
                     JOIN ingredientes i ON i.id = pi.ingrediente_id
                     WHERE pi.producto_id = $1`,
                    [detalle.producto_id]
                )

                // Ingredientes adicionales del pedido particular
                const extraResult = await pool.query(
                    `SELECT di.id, di.tipo, di.precio, i.nombre
                     FROM detalle_ingredientes di
                     JOIN ingredientes i ON i.id = di.ingrediente_id
                     WHERE di.detalle_pedido_id = $1`,
                    [detalle.id]
                )

                return { 
                    ...detalle, 
                    ingredientes: [...baseResult.rows, ...extraResult.rows] 
                }
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
        const estadosValidos = ['pendiente', 'preparando', 'listo', 'entregado']

        // [MODIFICADO] Validación de id y del campo estado antes de actualizar
        if (!id) {
            return res.status(400).json({ error: 'El id del pedido es requerido para actualizar' })
        }
        if (!estado) {
            return res.status(400).json({ error: 'El campo estado es requerido' })
        }
        if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ 
        error: `Estado inválido. Los estados válidos son: ${estadosValidos.join(', ')}` 
    })
}

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

//eliminar pedido
const eliminarPedidoById = async(req,res) =>{
    try{
        const {id} = req.params

        // [MODIFICADO] Validación de existencia del id previo a la eliminación
        if (!id) {
            return res.status(400).json({ error: 'El id del pedido es requerido para eliminar' })
        }
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

module.exports = { createPedidos,getPedidos,getPedidosById,actualizarEstadoPedido,eliminarPedidoById, getResumenPedidos, getHistorialPedidos}
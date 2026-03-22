const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Token no proporcionado' })
        }

        const token = authHeader.split(' ')[1] // Formato: Bearer eltoken123
        
        if (!token) {
            return res.status(401).json({ error: 'Formato de token inválido' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
        req.usuario = decoded 
        
        next()
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' })
    }
}

module.exports = { verificarToken }

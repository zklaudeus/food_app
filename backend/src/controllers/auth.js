const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    try {
        const { usuario, password } = req.body

        if (usuario !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Credenciales incorrectas' })
        }

        // Se usa JWT_SECRET para firmar el token, asegúrate de declarla en el archivo .env
        const token = jwt.sign(
            { usuario },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '8h' }
        )

        res.json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error al procesar el login' })
    }
}

module.exports = { login }

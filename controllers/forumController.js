const db = require('../config/database');

// Crear un nuevo foro
const createForum = async (req, res) => {
    try {
        const { nombre, descripcion, banner } = req.body;
        const userId = req.user.userId;

        if (!nombre) return res.status(400).json({ error: "El nombre es requerido" });

        // Procesar imagen (Banner) a Buffer si existe
        let bannerBuffer = null;
        if (banner && banner.startsWith('data:image')) {
            const base64Data = banner.replace(/^data:image\/\w+;base64,/, '');
            bannerBuffer = Buffer.from(base64Data, 'base64');
        }

        const [result] = await db.execute(
            `INSERT INTO foros (nombre, descripcion, id_creador, banner, fecha_creacion) 
             VALUES (?, ?, ?, ?, CURDATE())`,
            [nombre, descripcion, userId, bannerBuffer]
        );

        // El creador se une automáticamente al foro
        await db.execute(
            `INSERT INTO miembros_foro (id_usuario, id_foro, fecha_union) VALUES (?, ?, CURDATE())`,
            [userId, result.insertId]
        );

        res.status(201).json({ message: 'Foro creado', forumId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear foro' });
    }
};

// Listar todos los foros
const getAllForums = async (req, res) => {
    try {
        const [forums] = await db.execute(`
            SELECT f.id_foro, f.nombre, f.descripcion, f.fecha_creacion,
            (SELECT COUNT(*) FROM miembros_foro WHERE id_foro = f.id_foro) as total_miembros
            FROM foros f
        `);
        // Convertir banner a base64 si lo necesitas enviar
        // (Omitido aquí para brevedad, similar a usuarioController)
        res.json({ forums });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo foros' });
    }
};

// Unirse a un foro
const joinForum = async (req, res) => {
    try {
        const { id_foro } = req.body;
        const userId = req.user.userId;

        await db.execute(
            `INSERT INTO miembros_foro (id_usuario, id_foro, fecha_union) VALUES (?, ?, CURDATE())`,
            [userId, id_foro]
        );
        res.json({ message: 'Te has unido al foro exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Ya eres miembro de este foro' });
        }
        res.status(500).json({ error: 'Error al unirse al foro' });
    }
};

module.exports = { createForum, getAllForums, joinForum };
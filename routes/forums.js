const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { createForum, getAllForums, joinForum } = require('../controllers/forumController');

const router = express.Router();

router.use(authenticateToken); // Proteger todas las rutas

router.post('/', createForum);       // Crear foro
router.get('/', getAllForums);       // Ver foros
router.post('/join', joinForum);     // Unirse

module.exports = router;
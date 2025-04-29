const express = require("express")
const router = express.Router()
const axios = require("axios")
const { Rooms } = require("../models")

router.get("/:roomName", async (req, res) => {
    const roomName = req.params.roomName;
    const room = await Rooms.findOne({
        where: {
            name: roomName,
            active: true
        }
    })
    if (!room) {
        res.json({ "error": "No existe esa sala o esta inactiva" })
    } else {
        const { id } = room;
        res.json({ "id": id })
    }
})

router.post("/", async (req, res) => {
    try {
        const { roomName } = req.body
        await Rooms.create({ name: roomName, active: true })
        res.json({ roomName: roomName })
    } catch (error) {
        console.error("Error en la solicitud:", error);
        res.status(500).json({ error: error });
    }
})

router.patch("/:roomName", async (req, res) => {
    const roomName = req.params.roomName;
    const roomIdObject = await axios.get(`http://82.165.173.226:3001/rooms/${roomName}`);
    if (roomIdObject.data.error) {
        return res.json({ error: roomIdObject.data.error });
    }
    const { id } = roomIdObject.data;

    console.log(id)

    try {
        const room = await Rooms.findByPk(id);
        if (!room) {
            return res.status(404).json({ error: 'Room no encontrada' });
        }

        // Actualizar la propiedad específica
        room.active = false;
        await room.save();

        res.json({ message: '✅ Room desactivada correctamente', room });
    } catch (error) {
        res.status(500).json({ error: 'Error en el server intentando desactivar una room', detalle: error.message });
    }
})

module.exports = router
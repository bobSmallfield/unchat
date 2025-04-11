const express = require("express")
const router = express.Router()

const { Messages, Rooms } = require("../models");
const axios = require("axios");

router.get("/:roomName", async (req, res) => {
    try {
        const roomName = req.params.roomName;
        const response = await axios.get(`http://192.168.0.17:3001/rooms/${roomName}`);

        if (response.data.error) {
            return res.json({ error: response.data.error });
        }
        const { id } = response.data;
        const messagesList = await Messages.findAll({
            where: {
                RoomId: id,
            }
        });
        res.json({ messageList: messagesList });

    } catch (error) {
        console.error("Error en la solicitud:", error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

router.post("/", async (req, res) => {
    const { message, username, roomName } = req.body;
    const room = await Rooms.findOne({
        where: {
            name: roomName,
            active: true
        }
    })
    if (room) {
        const RoomId = room.id;
        await Messages.create({ message, username, RoomId });
        res.json({ message: message, username: username })
    } else {
        res.json({ error: "La sala no existe o ha expirado (sala '" + roomName + "'). Actualiza la página para solucionarlo." })
    }


})

module.exports = router
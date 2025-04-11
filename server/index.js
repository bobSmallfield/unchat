const express = require("express")
const cors = require("cors")
const axios = require("axios")
const http = require("http")
const { Server } = require("socket.io")

const db = require("./models")
const app = express()
app.use(cors())
app.use(express.json());

const colors = [
    "#d59191",
    "#73c871",
    "#9191d5",
    "#d591ca",
    "#d591c2",
    "#91d3d5",
    "#88b7e3",
    "#d5d291",
    "#d5b691",
    "#ace67c"
];

let activeRooms = {};

// Routers
const messagesRouter = require("./routes/Messages")
app.use("/messages", messagesRouter)
const roomsRouter = require("./routes/Rooms")
app.use("/rooms", roomsRouter)

// Socket.io
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PUT"]
    }
})

const userSockets = {}; // Objeto para mapear socket.id a username

const roomToInactive = async (roomName) => {
    try {
        const response = await axios.patch(`http://192.168.0.17:3001/rooms/${roomName}`, { "propiedad(meObliga)": "valor,inutil" });
        console.log('Sala desactivada:', response.data.message);
    } catch (error) {
        console.error('Error al desactivar la room:', error);
    }
};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", async ({ roomName, username }) => {
        socket.join(roomName);

        if (!activeRooms[roomName]) {
            activeRooms[roomName] = { users: [] };
            io.emit("new_room_created", { roomName });
        }

        // Verificamos si el usuario ya existe en la sala
        const userExists = activeRooms[roomName].users.some(userObj => userObj.username === username);
        if (!userExists) {
            // Se asigna un color aleatorio
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const userObj = { username, color: randomColor };
            activeRooms[roomName].users.push(userObj);
            // Se guarda la relación socket -> usuario, incluyendo el color
            userSockets[socket.id] = { username, roomName, color: randomColor };
        }

        console.log(`Usuario ${username} entró en la sala ${roomName}`);
        // Se emite el nuevo usuario y la lista actualizada de usuarios (ahora objetos)
        io.to(roomName).emit("new_user", { username, color: userSockets[socket.id] && userSockets[socket.id].color });
        io.to(roomName).emit("update_users", activeRooms[roomName].users);

        await axios.post("http://192.168.0.17:3001/messages", {
            "message": `${username} ha entrado en la sala`,
            "username": "server314159265",
            "roomName": roomName
        }).then(() => {
            console.log("Se ha añadido el nuevo user a la DB.");
        });
    });

    socket.on("send_message", (data) => {
        socket.to(data.roomName).emit("receive_message", data);
    });

    socket.on("leave_room", ({ roomName, username }) => {
        if (activeRooms[roomName]) {
            // Filtramos la lista de usuarios removiendo el objeto que tenga ese username
            activeRooms[roomName].users = activeRooms[roomName].users.filter(user => user.username !== username);

            if (activeRooms[roomName].users.length === 0) {
                delete activeRooms[roomName];
                roomToInactive(roomName);
            }

            console.log(`Usuario ${username} salió de la sala ${roomName}`);
            io.to(roomName).emit("update_users", activeRooms[roomName]?.users || []);
            io.to(roomName).emit("left_user", { username });

            axios.post("http://192.168.0.17:3001/messages", {
                "message": `${username} ha salido de la sala`,
                "username": "server314159265",
                "roomName": roomName
            }).then(() => {
                console.log("Se ha puesto el mensaje de salida del user a la DB.");
            });

            delete userSockets[socket.id]; // Eliminamos al usuario del mapa de sockets
        }

        socket.leave(roomName);
    });

    socket.on("disconnect", () => {
        const userData = userSockets[socket.id];

        if (userData && userData.username) {  // Verificar que tenemos un username válido
            const { username, roomName } = userData;

            if (activeRooms[roomName]) {
                // Removemos el usuario de la sala usando el username
                activeRooms[roomName].users = activeRooms[roomName].users.filter(user => user.username !== username);

                if (activeRooms[roomName].users.length === 0) {
                    delete activeRooms[roomName];
                    // Aquí es donde tenemos que actualizar, si es necesario.
                }

                console.log(`Usuario ${username} se desconectó de la sala ${roomName}`);
                io.to(roomName).emit("update_users", activeRooms[roomName]?.users || []);
                io.to(roomName).emit("left_user", { username });

                axios.post("http://192.168.0.17:3001/messages", {
                    "message": `${username} ha salido de la sala`,
                    "username": "server314159265",
                    "roomName": roomName
                }).then(() => {
                    console.log("Se ha registrado la desconexión en la DB.");
                });
            }

            delete userSockets[socket.id]; // Eliminamos al usuario del mapa de sockets
        }

        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start server

db.sequelize.sync().then(() => {
    server.listen(3001, () => {
        console.log("Listening on port 3001!")
    })
})
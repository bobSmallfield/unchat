import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from "axios"
import io from "socket.io-client"

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';

const socket = io.connect("http://192.168.0.17:3001")

function Room() {
  const navigate = useNavigate()
  const { roomName } = useParams()
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [currentUsername, setCurrentUsername] = useState("")
  const [displaySettings, setDisplaySettings] = useState(false)
  const [messageList, setMessageList] = useState([])
  const [roomExists, setRoomsExists] = useState(true)
  const [correctName1, setCorrectName1] = useState(true)
  const [correctName2, setCorrectName2] = useState(true)
  const [repeatedUsername, setRepeatedUsername] = useState(false)
  const [alreadySetUsername, setAlreadySetUsername] = useState(true)
  const [userList, setUserList] = useState([])
  const [correctUsername, setCorrectUsername] = useState(true)
  const localItem = localStorage.getItem("chattyChatUsername");
  const [changeRoom, setChangeRoom] = useState("")

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkUsername = () => {
      if (username) {
        const regex = /^.{0,20}$/;
        if (regex.test(username) && username.trim() !== "") { // meto las dos condiciones aqui para ahorrar espacio y problemas
          setCorrectUsername(true)
        } else {
          setCorrectUsername(false)
        }
      }
    }

    const checkRepeatedUsername = () => {
      const allUsers = userList.map(user => user.username).filter(user => user !== currentUsername)

      console.log(allUsers)

      if (allUsers.includes(username)) {
        setRepeatedUsername(true)
      } else {
        setRepeatedUsername(false)
      }
    }

    checkRepeatedUsername()
    checkUsername()


  }, [username])

  const updateUsername = () => {
    if (username.trim() !== "") {
      localStorage.setItem("chattyChatUsername", username)
      setCurrentUsername(username)
      setAlreadySetUsername(true)
    }
  }

  useEffect(() => {
    setCorrectName2(checkRoomName(roomName))

    axios.get(`http://192.168.0.17:3001/messages/${roomName}`).then((response) => {
      if (!response.data.error) {
        setMessageList(response.data.messageList)
        setRoomsExists(true)
        if (inputRef.current) inputRef.current.focus()
      } else {
        setRoomsExists(false)
      }
    })

    if (!localItem || localItem.trim() === "" || !correctUsername) {
      setDisplaySettings(true)
    } else {
      setCurrentUsername(localItem)
      setUsername(localItem)
    }
  }, [])

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((prevMessages) => [...prevMessages, data])
    })

    return () => {
      socket.off("receive_message") // Cleanup para evitar múltiples listeners
    }
  }, [roomExists])

  useEffect(() => {
    if (currentUsername && roomExists) {
      if (repeatedUsername) {
        setDisplaySettings(true)
        setCurrentUsername("")
      }

      socket.emit("join_room", { roomName, username: currentUsername });

      // Escuchar cambios en la lista de usuarios
      socket.on("update_users", (users) => {
        setUserList(users);
      });

      socket.on("new_user", (givenUsername) => {
        setMessageList((prevMessages) => [...prevMessages, { message: `${givenUsername.username} ha entrado en la sala`, username: "server314159265" }])
      });

      socket.on("left_user", (givenUsername) => {
        setMessageList((prevMessages) => [...prevMessages, { message: `${givenUsername.username} ha salido de la sala`, username: "server314159265" }])
      });

      const handleBeforeUnload = () => {
        socket.emit("leave_room", { roomName, username: currentUsername });
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        socket.emit("leave_room", { roomName, username: currentUsername });
        socket.off("update_users");
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [roomName, currentUsername]);

  const sendMessage = () => {
    if (message.trim() === "") {
      // alert("El mensaje no puede estar vacío") 
      return
    }
    axios.post("http://192.168.0.17:3001/messages", { "message": message, "username": localItem, "roomName": roomName }).then((response) => {
      if (!response.data.error) {
        const returnedMessage = response.data;
        setMessageList((prevMessages) => [...prevMessages, returnedMessage])
        console.log(returnedMessage)
        socket.emit("send_message", { ...returnedMessage, roomName })
        setMessage("")
      } else {
        alert(response.data.error)
      }
    })
  }

  const enterRoom = () => {
    if (changeRoom.trim() !== "") {
      navigate(`/${changeRoom}`)
      setRoomsExists(true)
      navigate(0)
    } else {
      alert("¡Introduce un nombre de sala!")
    }
  }

  const createRoom = () => {
    axios.post("http://192.168.0.17:3001/rooms", { "roomName": roomName }).then((response) => {
      if (!response.data.error) {
        setRoomsExists(true)
      } else {
        alert(response.data.error)
      }
    })
  }

  const checkRoomName = (wordToTest) => {
    const regex = /^[a-z0-9_-]+$/;
    if (regex.test(wordToTest)) {
      return true
    } else {
      return false
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const handleKeyDown = (e, option) => {
    if (e.key === 'Enter') {
      // e.preventDefault();
      if (option === "sendMessage") {
        sendMessage();
      } else if (option === "enterRoom") {
        enterRoom();
      }
    }
  };

  return (
    <div className='page'>
      {!displaySettings && roomExists &&
        <div className='bloque-invisible'></div>
      }

      <div className='chatSpace'>
        <div className='topBar'>
          <button onClick={() => {
            if ((displaySettings && (!currentUsername)) || !localItem) {
              navigate("/")
            } else if (displaySettings) {
              setDisplaySettings(false)
              setUsername(currentUsername)
            } else {
              navigate("/")
            }

          }} className={displaySettings ? 'backButton' : "backButton reverse"}>{displaySettings ? <ArrowBackIcon></ArrowBackIcon> : <LogoutIcon></LogoutIcon>}</button>
          <p className='roomName'>{roomName}</p>
          <button disabled={
            !roomExists || ((!username || !correctUsername || repeatedUsername) && displaySettings)} onClick={() => {
              if (!displaySettings) {
                setDisplaySettings(true)
              } else {
                setDisplaySettings(false)
                updateUsername()
                setUsername(localItem)
              }
            }}>{(displaySettings && (username !== currentUsername)) ? <SaveIcon></SaveIcon> : displaySettings ? <CloseIcon></CloseIcon> : <SettingsIcon></SettingsIcon>}
          </button>
        </div>
        {roomExists ? (
          <>
            {displaySettings ? (
              <div className='settingsBox'>
                <div className='settingBoxVertical'>
                  <div className='settingBox'>
                    <label className='settingsLabel' htmlFor="username">Nombre</label>
                    <input className='settingsInput' name='username' id='username' placeholder={currentUsername || "Nombre de usuario..."} type="text" value={username} onChange={(e) => {
                      setUsername(e.target.value)
                    }} />
                  </div>
                  {(!currentUsername && !username) && <p className='settingsMessage error'>¡Debes introducir un nombre de usuario para entrar en la sala!</p>}
                  {!correctUsername && <p className='settingsMessage error'>Tu nombre de usuario debe tener como máximo 20 caracteres.</p>}
                  {repeatedUsername && <p className='settingsMessage error'>Ya hay alguien con ese nombre en esta sala</p>}
                </div>
                <div className="setting-box users-list users-list-inside">
                  <h3>Usuarios en la sala:</h3>
                  <ul>
                    {userList.map((user, index) => (
                      <li style={{ color: user.color || "#d59191" }} key={index}> - {user.username}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className='messages'>
                  <p className='disclaimer'>Esta aplicación está en su etapa beta. Si encuentras bugs o glitches, no dudes en contactar conmigo a través de <a rel="noreferrer" target="_blank" href='https://x.com/BobbySmallfield'>Tweeter</a> o por correo (bobbysmallfield@gmail.com)</p>
                  {messageList.map((value, key) => {
                    const prevMsg = messageList[key - 1]
                    const nextMsg = messageList[key + 1]

                    const isSameSenderAsPrev = prevMsg && prevMsg.username === value.username;
                    const isSameSenderAsNext = nextMsg && nextMsg.username === value.username;

                    let messageClass = "message"

                    if (value.username === currentUsername) messageClass += " own-message"
                    if (isSameSenderAsPrev) messageClass += " another-message-top";
                    if (isSameSenderAsNext) messageClass += " another-message-bottom";
                    if (value.username === "server314159265") messageClass += " server-message";
                    const color = userList.find(user => user.username === value.username)
                    return (
                      <div
                        ref={chatRef}
                        className={messageClass}
                        key={key}>
                        {(value.username !== "server314159265" && !isSameSenderAsPrev && value.username !== currentUsername) && <p style={{
                          color: color ? color.color : "#d59191"
                        }} className='username'>{value.username}</p>
                        }
                        <p className='text'>{value.message}</p>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className='inputContainer'>
                  <input onKeyDown={(e) => { handleKeyDown(e, "sendMessage") }} ref={inputRef} className='sendInput' value={message} onChange={(e) => {
                    setMessage(e.target.value)
                  }} placeholder="Escribe un mensaje..." />
                  <button disabled={!message} className='sendButton' onClick={() => {
                    inputRef.current.focus();
                    sendMessage()
                  }}><SendIcon></SendIcon></button>
                </div>
                <p className='footer'>&copy; 2025 UnChat.es • Built by <a rel="noreferrer" target="_blank" href='https://x.com/BobbySmallfield'>Bob Smallfield</a></p>
              </>
            )}
          </>
        ) : (
          // "NE" en las clases de css significa no existe, o sea que pertenece a esta sección (es para diferenciar del resto).
          <div className='ne-container'>
            <h2 className='ne-title'>La sala "{roomName}" aún no existe</h2>
            <button className='create-room-button' disabled={!checkRoomName(roomName)} onClick={createRoom}>Crear sala "{roomName}"</button>
            {(!correctName2) && <p className='error'>No puedes crear esta sala. El nombre de la sala solo puede contener letras minúsculas, números, "-" y "_"</p>}
            <div className='divider'></div>
            <div className='ne-another-room'>
              <input onKeyDown={(e) => { handleKeyDown(e, "enterRoom") }} value={changeRoom} onChange={(e) => {
                setChangeRoom(e.target.value)
                setCorrectName1(checkRoomName(e.target.value))
              }} placeholder="Conectarme a otra sala..." />
              <button className='another-room-button' disabled={!correctName1} onClick={enterRoom}>Entrar o crear</button>
            </div>
            {(!correctName1) && <p className='error'>El nombre de la sala puede contener letras minúsculas, números, "-" y "_"</p>}
          </div>
        )}

      </div>
      {!displaySettings && roomExists &&
        <div className="users-list users-list-outside">
          <h3>Usuarios en la sala:</h3>
          <ul>
            {userList.map((user, index) => (
              <li style={{ color: user.color || "#d59191" }} key={index}> - {user.username}</li>
            ))}
          </ul>
        </div>


      }
    </div >
  )
}

export default Room

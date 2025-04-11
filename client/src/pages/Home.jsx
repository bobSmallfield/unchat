import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styles from '../Home.module.css';

function Home() {
  const navigate = useNavigate()
  const [roomName, setRoomName] = useState("");
  const [correctName, setCorrectName] = useState(true)

  const enterRoom = () => {
    if (roomName.trim() !== "") {
      navigate(`/${roomName}`)
    } else {
      alert("¡Introduce un nombre de sala!")
    }
  }

  const checkRoomName = (wordToTest) => {
    const regex = /^[a-z0-9_-]+$/;
    if (regex.test(wordToTest)) {
      return true
    } else {
      return false
    }
  }

  const checkEnter = (e) => {
    if (e.key === "Enter") {
      enterRoom()
    }
  }

  return (
    <div className={styles.home}>
      {/* Sección Hero: ocupa toda la pantalla */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroLogo}><img onClick={() => { navigate("/") }} src="/logo.png" alt="" /></div>
          <h1 className={styles.title}>Chatea en un click</h1>
          <p className={styles.subtitle}>
            Crea una sala. Chatea con tus amigos. Sin registro. Así de fácil.
          </p>
          <div className={styles.joinRoom}>
            <input onKeyDown={(e) => { checkEnter(e) }} value={roomName} onChange={(e) => {
              setRoomName(e.target.value)
              setCorrectName(checkRoomName(e.target.value))
            }} placeholder="Nombre de la sala..." />
            <button onClick={enterRoom}>Entrar</button>
            {/* {!correctName && <p>El nombre de la sala solo puede contener minúsculas, números, "-" y "_"</p>} */}
          </div>
        </div>
        <div className={styles.heroImg}></div>
      </section>
      {/* Pasos, instrucciones */}
      <section className={styles.steps}>
        <div id='step1' className={styles.step}>
          <img src="/1.png" alt="uno" />
          <h2>Entra en una sala</h2>
          {/* <p>
            Una interfaz intuitiva, similar.
          </p> */}
        </div>
        <div id='step2' className={styles.step}>
          <img src="/2.png" alt="dos" />
          <h2>Ponte un nombre</h2>
          {/* <p>
            Una interfaz intuitiva, similar.
          </p> */}
        </div>
        <div id='step3' className={styles.step}>
          <img src="/3.png" alt="tres" />
          <h2>¡Comienza a chatear!</h2>
          {/* <p>
            Una interfaz intuitiva, similar.
          </p> */}
        </div>
      </section>

      {/* Sección de Características o Ventajas */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <img src="/fast.png" alt="rápido" />
          <h2>Rápido</h2>
          <p>
            Sin registrarte, sin iniciar sesión... Solo entra en una sala, ponte un nombre, ¡y comienza a chatear!
          </p>
        </div>
        <div className={styles.feature}>
          <img src="/private.png" alt="privado" />
          <h2>Privado</h2>
          <p>
            No pedimos tu e-mail, ni robamos contraseñas. La sala se elimina una vez todos los usuarios han salido de ella.
          </p>
        </div>
        <div className={styles.feature}>
          <img src="/easy.png" alt="sencillo" />
          <h2>Intuitivo</h2>
          <p>
            Una interfaz intuitiva, similar a otras aplicaciones de mensajería, que no da lugar a dudas: ¡es facilísimo!
          </p>
        </div>
      </section>


      {/* Sección Call To Action */}
      <section className={styles.cta}>
        <h2>Únete o crea una conversación ahora</h2>
        <div className={styles.joinRoom}>
          <input value={roomName} onKeyDown={(e) => {checkEnter(e)}} onChange={(e) => {
            setRoomName(e.target.value)
            }} type="text" placeholder="Nombre de la sala" />
          <button onClick={enterRoom}>Entrar</button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 unchat.es • Built by <a target='_blank' href='https://x.com/BobbySmallfield'>Bob Smallfield</a></p>
      </footer>
      <div>
      </div>
    </div>
  )
}

export default Home

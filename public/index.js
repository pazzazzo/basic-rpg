import { Peer } from "https://esm.sh/peerjs@1.5.5?bundle-deps"
import Main from "./Main.js"
const socket = io({ reconnection: true })
const usernameInp = document.getElementById("username-inp")
const passwordInp = document.getElementById("password-inp")
const loginBtn = document.getElementById("login-btn")
const registerBtn = document.getElementById("register-btn")
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const charPrevBtn = document.getElementById("char-prev-btn")
const charNextBtn = document.getElementById("char-next-btn")
const registerUsernameInp = document.getElementById("register-username-inp")
const registerPasswordInp = document.getElementById("register-password-inp")
const registerPasswordRepeatInp = document.getElementById("register-password-repeat-inp")
const registerLoginBtn = document.getElementById("register-login-btn")
const registerRegisterBtn = document.getElementById("register-register-btn")
const loginError = document.getElementById("login-error")
const registerError = document.getElementById("register-error")

let loginStep = 1

window.socket = socket

socket.on("links", links => {
    links.forEach(link => {
        console.log(link);
    })
})

socket.on("disconnect", (r, err) => {
    console.log("disc 2: ", r);
    if (loginStep === 0) {
        window.__main.destroy()
        loginForm.classList.remove("hidden")
        document.body.classList.add("init")
        document.querySelector("#game").classList.add("hidden")
        document.querySelector("#ui").classList.add("hidden")
        loginStep = 1
    }
    if (loginStep === 2) {
        loginError.innerText = `You have been disconnected due to: ${r}.`
    } else {
        loginError.innerText = `You have been disconnected due to: ${r}.`
    }

});

/** @type {HTMLCanvasElement} */
const playerRenderer = document.getElementById("player-renderer")

const playerCTX = playerRenderer.getContext("2d")

const characters = [
    "erio",
    "hero",
    "npc1",
    "npc2",
    "npc3",
    "npc4",
    "npc5",
]

const charactersImg = []

characters.forEach(c => {
    let img = new Image()
    img.src = `./assets/characters/people/${c}.png`
    charactersImg.push(img)
})

let selectedCharacter = 1
let currentAnimationFrame = 0
let currentAnimationDir = 0

let inpEv = (ev) => {
    ev.target.value = ev.target.value.replace(/ /g, "")
    ev.target.classList.remove("incorrect")
}
usernameInp.oninput = inpEv
passwordInp.oninput = inpEv
registerUsernameInp.oninput = inpEv
registerPasswordInp.oninput = inpEv
registerPasswordRepeatInp.oninput = inpEv

loginBtn.addEventListener("click", () => {
    let username = usernameInp.value.replace(/ /g, "")
    let password = passwordInp.value
    if (username && password) {
        socket.emit("login", {username, password}, r => {
            connect(r, loginError, username)
        })
    }
})
registerRegisterBtn.addEventListener("click", () => {
    let username = registerUsernameInp.value.replace(/ /g, "")
    let password = registerPasswordInp.value
    let password2 = registerPasswordRepeatInp.value
    if (username) {
        if (!password) {
            registerError.innerText = `You must set a password`
            registerPasswordInp.classList.add("incorrect")
        } else if (password !== password2) {
            registerError.innerText = `Passwords doesn't match`
            registerPasswordInp.classList.add("incorrect")
            registerPasswordRepeatInp.classList.add("incorrect")
        } else {
            socket.emit("register", { username, password, skin: characters[selectedCharacter] }, r => {
                connect(r, registerError, username)
            })
        }
    }
})

function connect(r, err, v) {
    if (r.ok) {
        const peer = new Peer(v, {
            path: "/peerjs",
            host: "/",
            port: "3000",
        });
        loginForm.classList.add("hidden")
        registerForm.classList.add("hidden")
        document.body.classList.remove("init")
        document.querySelector("#game").classList.remove("hidden")
        document.querySelector("#ui").classList.remove("hidden")
        window.__main = new Main(v, socket, peer)
        window.__main.init()

        loginStep = 0
    } else {
        err.innerText = r.message
        if (r.incorrect) {
            r.incorrect.forEach(id => {
                document.getElementById(id).classList.add("incorrect")
            })
        }
    }
}

registerBtn.addEventListener("click", () => {
    loginForm.classList.add("hidden")
    registerForm.classList.remove("hidden")
    registerUsernameInp.value = usernameInp.value
    registerPasswordInp.value = passwordInp.value
    loginStep = 2
})

registerLoginBtn.addEventListener("click", () => {
    loginForm.classList.remove("hidden")
    registerForm.classList.add("hidden")
    usernameInp.value = registerUsernameInp.value
    passwordInp.value = registerPasswordInp.value
    loginStep = 1
})

playerRenderer.addEventListener("click", () => {
    currentAnimationDir = (currentAnimationDir + 1) % 4
})

charPrevBtn.addEventListener("click", () => {
    selectedCharacter = (selectedCharacter + characters.length - 1) % characters.length
})
charNextBtn.addEventListener("click", () => {
    selectedCharacter = (selectedCharacter + 1) % characters.length
})

setInterval(() => {
    currentAnimationFrame = (currentAnimationFrame + 1) % 4
}, 150);

let draw = () => {
    playerCTX.clearRect(0, 0, playerRenderer.width, playerRenderer.height)
    playerCTX.drawImage(charactersImg[selectedCharacter], currentAnimationFrame * 32, currentAnimationDir * 32, 32, 32, 0, 0, 32, 32)
    requestAnimationFrame(draw)
}
draw()
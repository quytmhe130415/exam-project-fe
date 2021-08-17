const { ipcRenderer, session } = require('electron');
const iconUser = document.querySelector('.icon-user');
const iconPass = document.querySelector('.icon-lock');
const userName = document.querySelector('#name');
const pass = document.querySelector('#pass');

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const user = {
        userName: userName.value,
        pass: pass.value
    }

    await fetch(`http://localhost:3000/login`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then((res) => {
        return res.json();
    }).then((data) => {
        if (data) {
            sessionStorage.setItem("rule", data.rule);
            sessionStorage.setItem("name", data.userName);
            sessionStorage.setItem("id", data._id);
            ipcRenderer.send('accept-login-message', data);
        } else throw new Error()
    }).catch(() => {
        ipcRenderer.send('login-fail')
    })
})

ipcRenderer.once('send-session', () => {
    ipcRenderer.send('send-session', sessionStorage)
})

iconUser.addEventListener('click', (e) => {
    e.preventDefault();
    userName.focus();
})


iconPass.addEventListener('click', (e) => {
    e.preventDefault();
    pass.focus();
})
const { ipcRenderer } = require("electron");


const form = document.querySelector('form');



form.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.querySelector('#input-code').value;
  ipcRenderer.send('send-code-subject', code);
})

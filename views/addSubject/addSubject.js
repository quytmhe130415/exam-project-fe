const { ipcRenderer } = require("electron");

const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const subject = {
    subjectCode: document.querySelector('#subjectCode').value,
    subjectName: document.querySelector('#subjectName').value,
  }
  ipcRenderer.send('save-subject', subject)
})
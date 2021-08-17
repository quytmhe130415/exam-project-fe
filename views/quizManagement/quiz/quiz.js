const selectionTag = document.querySelector('#subject');
const tableQuiz = document.querySelector('#quizMana');
const btn_Add = document.querySelector('#btn_add');
const btn_quizzes = document.querySelector('#btn_Quizzes');
const btn_Student = document.querySelector('#btn_Student');
const btn_Logout = document.querySelector('#btn_Logout');
const { ipcRenderer } = require('electron');
const { removeSession, createOption, createTableQuizzes } = require('../../createElement.js');
const btn_subject = document.querySelector('#btn_Subject')

btn_quizzes.disabled = true;


selectionTag.addEventListener('change', (e) => {
  e.preventDefault();
  tableQuiz.innerHTML = '';
  if (Number(selectionTag.value) !== 0) {
    ipcRenderer.send('get-all-quizzes', { userId: sessionStorage.getItem('id'), subjectCode: selectionTag.value });
  }
})

btn_Student.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('open-Students', { rule: sessionStorage.getItem('rule') })
})

btn_quizzes.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('open-Quizzes', { rule: sessionStorage.getItem('rule') })
})

btn_Logout.addEventListener('click', (e) => {
  e.preventDefault();
  removeSession();
  ipcRenderer.send('user-Logout')
})

btn_Add.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('open-new-window', { isAdd: true })
})

btn_subject.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('open-subject');
})



ipcRenderer.send('get-subjects')

ipcRenderer.on('subjects-json', (_, subjectsJson) => {
  for (const subject of subjectsJson) {
    createOption(subject.subjectCode, subject.subjectName)
  }
  ipcRenderer.send('get-all-quizzes', { userId: sessionStorage.getItem('id'), subjectCode: subjectsJson[0].subjectCode });
})


ipcRenderer.on('quizzes-json', (_, quizzesJson) => {
  createTableQuizzes(quizzesJson)
})

ipcRenderer.on('update-quiz', () => {
  tableQuiz.innerHTML = '';
  ipcRenderer.send('get-all-quizzes', { userId: sessionStorage.getItem('id'), subjectCode: selectionTag.value });
})


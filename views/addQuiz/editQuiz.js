const { ipcRenderer } = require("electron");
ipcRenderer.send('get-quiz-edit');
const { createOption, createDivAnswer } = require('../createElement');
const selectionTag = document.querySelector('#subject')
const btn_save = document.querySelector('#btn_submit');
const btn_add_answer = document.querySelector('#btn_add_answer');
const question = document.querySelector('#question textarea')
const form = document.querySelector('form')

let sessions = null;
let quizId = null;

ipcRenderer.on('main-send-quiz-edit', (event, payload) => {
    if (payload) {
        quizId = payload.quiz._id;
        question.value = payload.quiz.question;

        for (let i = 0; i < payload.quiz.answer.length; i++) {
            createDivAnswer(payload.quiz.answer[i], payload.quiz.answer.length, i + 1)
        }

        const arrCheckbox = document.querySelectorAll('input[type="checkbox"]');
        for (let i = 0; i < payload.quiz.correct.length; i++) {
            arrCheckbox[payload.quiz.correct[i]].checked = true;
        }
        ipcRenderer.send('get-subjects')

        ipcRenderer.on('subjects-json', (_, subjectsJson) => {
            for (const subject of subjectsJson) {
                createOption(subject.subjectCode, subject.subjectName)
            }
            selectionTag.value = payload.subjectCode;
            console.log(selectionTag.value)
        })
    }
})



ipcRenderer.send('get-session')
ipcRenderer.on('main-send-session', (_, session) => {
    sessions = session;
})




btn_save.textContent = 'Save'

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const question = document.querySelector('#question textarea').value;
    const answersTextarea = document.querySelectorAll('#answers textarea');
    let arrAnswer = [];
    let correct = [];

    for (const answerInput of answersTextarea) {
        arrAnswer.push(answerInput.value)
    }

    const arrCheckbox = document.querySelectorAll(`input[type='checkbox']`);

    for (let i = 0; i < arrCheckbox.length; i++) {
        if (arrCheckbox[i].checked === true) {
            correct.push(i);
        }
    }

    const objectQuestion = {
        subject: selectionTag.value,
        quiz: {
            question: question,
            answer: arrAnswer,
            status: true,
            userId: sessions.id,
            correct: correct
        },
        quizId: quizId
    }

    ipcRenderer.send('fetch-post-edit-quiz', objectQuestion)
})


btn_add_answer.addEventListener('click', (e) => {
    e.preventDefault();
    createDivAnswer();
})
const { ipcRenderer } = require("electron");
const displayQuestion = document.querySelector('.displayQuestion');
const buttonQuestion = document.querySelector('.buttonQuestion');
const displayAnswer = document.querySelector('.answers');
const checkboxExit = document.querySelector('#exitExam');
const btnFinish = document.querySelector('#finish');
const divInfo = document.querySelector('.info');
const current_date = new Date();
const userId = sessionStorage.getItem('id')
const { removeSession } = require('../../createElement')
let currentQuizId = null;
const HOUR_MINUTE = 60;
const MINUTE_SECOND = 60;
let Duration = 0;

ipcRenderer.send('get-Quizzes');

ipcRenderer.send('get-computer-name')

checkboxExit.addEventListener('change', (e) => {
  e.preventDefault();

  if (checkboxExit.checked) {
    btnFinish.disabled = false;
  } else {
    btnFinish.disabled = true;
  }
})



let userExam = null;
ipcRenderer.on('main-send-quizzes', (event, quizzes) => {
  createQuizFrame(quizzes[0]);
  currentQuizId = quizzes[0]._id;
  userExam = quizzes.map((quiz) => { return { questionId: quiz._id, userAnswer: [] } });

  let TOTAL_TIME = quizzes.length * MINUTE_SECOND;
  let hour = parseInt(TOTAL_TIME / (HOUR_MINUTE * MINUTE_SECOND));
  let minute = (TOTAL_TIME % (HOUR_MINUTE * MINUTE_SECOND)) / MINUTE_SECOND;
  let second = ((TOTAL_TIME % (HOUR_MINUTE * MINUTE_SECOND)) % MINUTE_SECOND);
  const divTimer = document.querySelector('.timer')
  Duration = TOTAL_TIME / MINUTE_SECOND;

  const time = setInterval(() => {
    TOTAL_TIME -= 1;
    divTimer.textContent = `Time Left : ${hour}:${minute}:${second}`
    second -= 1;
    if (second <= 0) {
      minute -= 1;
      second = MINUTE_SECOND;
    }
    if (minute <= 0 && hour !== 0) {
      hour -= 1;
      minute = 60;
    }
    if (TOTAL_TIME < MINUTE_SECOND) {
      document.querySelector('.timer').style.color = '#d63031'
    }

    if (TOTAL_TIME < 0) {
      const date = `${current_date.getDate()}/${current_date.getMonth() + 1}/${current_date.getFullYear()}`
      console.log(userExam)
      ipcRenderer.send('finish-exam', { userId: userId, exam: userExam, date: date });
      clearInterval(time)
    }
  }, 100);

  for (let i = 0; i < quizzes.length; i++) {
    generateBtnQuestion(i + 1, quizzes[i]);
  }
})

btnFinish.addEventListener('click', () => {
  const date = `${current_date.getDate()}/${current_date.getMonth() + 1}/${current_date.getFullYear()}`
  ipcRenderer.send('finish-exam', { userId: userId, exam: userExam, date: date });
  removeSession();
  ipcRenderer.send('user-Logout')
})

const createQuizFrame = (quiz) => {
  displayQuestion.innerHTML = '';
  displayAnswer.innerHTML = '';
  const divQuestion = document.createElement('div');
  const question = document.createElement('textarea');
  question.setAttribute('class', 'textareaQuestion')
  question.readOnly = true;
  question.value = `Question : ${quiz.question}`;
  divQuestion.appendChild(question);
  displayQuestion.appendChild(divQuestion);

  for (let i = 0; i < quiz.answer.length; i++) {
    const anEl = document.createElement('div');
    anEl.setAttribute('class', 'anEl')

    const inputEl = document.createElement('input')

    inputEl.addEventListener('change', (e) => {
      e.preventDefault();
      let arrTextAnswer = [];
      if (inputEl.checked === true) {
        const inputChecked = displayAnswer.querySelectorAll('input:checked');
        if (inputChecked.length !== 0) {
          document.querySelector(`#${quiz._id}`).style.backgroundColor = "green";
        }
      } else {
        const inputChecked = displayAnswer.querySelectorAll('input:checked');
        if (inputChecked.length == 0) {
          document.querySelector(`#${quiz._id}`).style.backgroundColor = "";
        }
      }


      const inputChecked = displayAnswer.querySelectorAll('input:checked');

      for (const input of inputChecked) {
        arrTextAnswer.push(input.value)
      }

      for (const question of userExam) {
        if (question.questionId === currentQuizId) {
          question.userAnswer = inputChecked;

          question.textAnswers = arrTextAnswer;
          break;
        }
      }
    })

    if (quiz.correctLength > 1) {
      document.querySelector('#typeQuestion').textContent = 'multiple choice'
      inputEl.setAttribute('type', 'checkbox');
      inputEl.setAttribute('id', `answer-${i}`)
    } else {
      document.querySelector('#typeQuestion').textContent = 'single choice'
      inputEl.setAttribute('type', 'radio')
      inputEl.setAttribute('name', 'answersRadio')
      inputEl.setAttribute('id', `answer-${i}`)
    }


    inputEl.value = quiz.answer[i];
    const textAnswer = document.createElement('h3')
    textAnswer.textContent = quiz.answer[i];
    anEl.appendChild(inputEl)
    anEl.appendChild(textAnswer)

    displayAnswer.appendChild(anEl)
  }

  if (userExam) {
    for (const question of userExam) {
      if (quiz._id === question.questionId) {
        for (const answer of question.userAnswer) {
          document.querySelector(`#${answer.getAttribute('id')}`).checked = true;
        }
      }
    }
  }
  currentQuizId = quiz._id;
}

const generateBtnQuestion = (i, quiz) => {
  const btn_quiz = document.createElement('button');
  btn_quiz.textContent = i;
  btn_quiz.setAttribute('id', quiz._id)

  btn_quiz.addEventListener('click', (e) => {
    e.preventDefault();
    createQuizFrame(quiz, btn_quiz);
  })
  buttonQuestion.appendChild(btn_quiz)
}

ipcRenderer.send('get-exam-code');


ipcRenderer.on('main-sand-exam-code', (event, examCode) => {
  createDivInfo(examCode)
})

const createDivInfo = (examCode) => {
  const userName = document.createElement('h4');
  userName.textContent = `User Name : ${sessionStorage.getItem('name')}`

  const code = document.createElement('h4');
  code.textContent = `Exam Code : ${examCode}`;

  const duration = document.createElement('h4');
  duration.textContent = `Duration : ${Duration} (minutes)`;


  const date = document.createElement('h4');
  date.textContent = `Date : ${current_date.getDate()}-${current_date.getMonth() + 1}-${current_date.getFullYear()}`;

  divInfo.appendChild(userName)
  divInfo.appendChild(code)
  divInfo.appendChild(duration)
  divInfo.appendChild(date)
}

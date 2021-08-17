const selectionTag = document.querySelector('#subject');
const divAnswers = document.querySelector('#answers');
const { ipcRenderer } = require('electron');
const scoreTable = document.querySelector('#score');
const subjectTable = document.querySelector('#subject')
const tableQuiz = document.querySelector('#quizMana');

const removeSession = () => {
  sessionStorage.removeItem('id');
  sessionStorage.removeItem('name');
  sessionStorage.removeItem('rule');
}

const resetTableScore = () => {
  scoreTable.innerHTML = '';
  const trHeader = document.createElement('tr');
  const tdSubject = document.createElement('th');
  const subjectNode = document.createTextNode('subject')
  tdSubject.appendChild(subjectNode)

  const tdScore = document.createElement('th');
  const scoreNode = document.createTextNode('score')
  tdScore.appendChild(scoreNode);

  const tdDate = document.createElement('th');
  const dateNode = document.createTextNode('Date (dd/mm/yyyy)')
  tdDate.appendChild(dateNode);

  trHeader.appendChild(tdSubject);
  trHeader.appendChild(tdScore);
  trHeader.appendChild(tdDate);

  scoreTable.appendChild(trHeader);
}

function createOption(subjectCode, subjectName) {
  const optionTag = document.createElement('option')
  optionTag.setAttribute('value', subjectCode)
  const textNode = document.createTextNode(subjectName);
  optionTag.appendChild(textNode)
  selectionTag.append(optionTag)
}


function createTableQuizzes(quizzesJson) {

  const trHeader = document.createElement('tr');

  const thQuestion = document.createElement('th');
  const questionNode = document.createTextNode('Question');
  thQuestion.appendChild(questionNode);
  trHeader.appendChild(thQuestion);

  const thAnswer = document.createElement('th');
  const answerNode = document.createTextNode('Answers');
  thAnswer.appendChild(answerNode);
  trHeader.appendChild(thAnswer);

  const thCorrectAnswer = document.createElement('th');
  const correctAnswerNode = document.createTextNode('Correct Answer');
  thCorrectAnswer.appendChild(correctAnswerNode);
  trHeader.appendChild(thCorrectAnswer);

  const thEdit = document.createElement('th');
  const editNode = document.createTextNode('Edit');
  thEdit.appendChild(editNode);
  trHeader.appendChild(thEdit);


  const thDisable = document.createElement('th');
  const disableNode = document.createTextNode('Disable');
  thDisable.appendChild(disableNode);
  trHeader.appendChild(thDisable);

  tableQuiz.appendChild(trHeader)

  for (const quiz of quizzesJson) {
    const trQuiz = document.createElement('tr');
    const tdQuestion = document.createElement('td');
    // const questionNode = document.createTextNode(quiz.question)

    //! append textarea
    const questionTextarea = document.createElement('textarea')
    questionTextarea.setAttribute('class', 'textareaQuestion')
    questionTextarea.readOnly = true;
    questionTextarea.value = quiz.question;


    tdQuestion.appendChild(questionTextarea)


    trQuiz.appendChild(tdQuestion)
    const tdAnswers = document.createElement('td');
    const ulAnswer = document.createElement('ul')
    for (const answer of quiz.answer) {
      const liAnswer = document.createElement('li')
      const liMode = document.createTextNode(answer);
      liAnswer.appendChild(liMode);
      ulAnswer.appendChild(liAnswer);
    }
    tdAnswers.appendChild(ulAnswer)
    trQuiz.appendChild(tdAnswers);


    const tdCorrect = document.createElement('td');
    const ulCorrect = document.createElement('ul')
    for (const correct of quiz.correct) {
      const liCorrect = document.createElement('li')
      const liNode = document.createTextNode(quiz.answer[correct]);
      liCorrect.appendChild(liNode);
      ulCorrect.appendChild(liCorrect);
    }
    tdCorrect.appendChild(ulCorrect)
    trQuiz.appendChild(tdCorrect);

    const tdEdit = document.createElement('td');
    const btnEdit = document.createElement('button')
    btnEdit.addEventListener('click', (e) => {
      e.preventDefault();
      ipcRenderer.send('open-new-window', { isAdd: false, quiz: quiz, subjectCode: selectionTag.value })
    })
    btnEdit.setAttribute('id', quiz._id)
    btnEdit.appendChild(document.createTextNode('Edit'))
    tdEdit.appendChild(btnEdit)
    trQuiz.appendChild(tdEdit)


    const tdDisable = document.createElement('td');
    const btnDisable = document.createElement('button')

    btnDisable.addEventListener('click', (e) => {
      e.preventDefault();
      ipcRenderer.send('disable-enable-quiz', { subject: selectionTag.value, quiz: quiz });
    })
    if (quiz.status) {
      btnDisable.appendChild(document.createTextNode('Disable'))
      tdDisable.appendChild(btnDisable)
    } else {
      btnDisable.appendChild(document.createTextNode('Enable'))
      tdDisable.appendChild(btnDisable)
    }

    trQuiz.appendChild(tdDisable)

    tableQuiz.appendChild(trQuiz);
  }
}

let countAnswers = 0;
const createDivAnswer = (answer, countAnswer, index, isCorrect) => {
  if (answer) {
    countAnswers = countAnswer - 1;
  }
  countAnswers++;
  const divAnswer = document.createElement('div');
  divAnswer.setAttribute('class', 'divAnswer')

  const divUpdate = document.createElement('div');

  const textNumberAnswer = document.createElement('h3');
  textNumberAnswer.setAttribute('class', 'textAnswer')

  if (answer) {
    const nodeNumberAnswer = document.createTextNode("Answer : " + index)
    textNumberAnswer.appendChild(nodeNumberAnswer)
  } else {
    const nodeNumberAnswer = document.createTextNode("Answer : " + countAnswers)
    textNumberAnswer.appendChild(nodeNumberAnswer)
  }


  divUpdate.appendChild(textNumberAnswer)

  const btnDelete = document.createElement('button');
  const nodeDelete = document.createTextNode("Delete")
  btnDelete.appendChild(nodeDelete)

  btnDelete.addEventListener('click', () => {
    divAnswer.remove();
    countAnswers--;
    const countTextAnswer = document.querySelectorAll('.textAnswer');
    for (let i = 0; i < countTextAnswer.length; i++) {
      countTextAnswer[i].textContent = `Answer : ${i + 1}`;
    }
  })

  divUpdate.appendChild(btnDelete)

  divAnswer.appendChild(divUpdate)

  const divInput = document.createElement('div');

  const inputAnswer = document.createElement('textarea')
  inputAnswer.setAttribute('required', 'true')
  if (answer) {
    inputAnswer.value = answer
  }
  divInput.appendChild(inputAnswer)



  const checkboxCorrect = document.createElement('input')
  if (answer && isCorrect) {
    checkboxCorrect.checked = true
  }
  checkboxCorrect.setAttribute('type', 'checkbox')
  divInput.appendChild(checkboxCorrect)

  divAnswer.appendChild(divInput)

  divAnswers.appendChild(divAnswer)
}

const resetTableSubject = () => {
  subjectTable.innerHTML = '';
  const trHeader = document.createElement('tr');

  const thSubjectCode = document.createElement('th');
  thSubjectCode.textContent = 'Subject Code'

  const thSubjectName = document.createElement('th');
  thSubjectName.textContent = 'Subject Name'

  const thDelete = document.createElement('th');
  thDelete.textContent = 'Delete Subject'

  trHeader.appendChild(thSubjectCode);
  trHeader.appendChild(thSubjectName);
  trHeader.appendChild(thDelete);

  subjectTable.appendChild(trHeader);
}

const createTableSubject = (subject) => {
  console.log(subject)
  const trSubject = document.createElement('tr')

  const tdSubCode = document.createElement('td')
  tdSubCode.textContent = subject.subjectCode;

  const tdSubName = document.createElement('td')
  tdSubName.textContent = subject.subjectName;

  const tdDelete = document.createElement('td')
  const btnDelete = document.createElement('button')
  btnDelete.textContent = 'Delete'
  btnDelete.addEventListener('click', (e) => {
    e.preventDefault();
    ipcRenderer.send('delete-subject', subject._id);
  })
  tdDelete.appendChild(btnDelete)

  trSubject.appendChild(tdSubCode);
  trSubject.appendChild(tdSubName);
  trSubject.appendChild(tdDelete);

  subjectTable.appendChild(trSubject)
}



module.exports = { createTableSubject, resetTableSubject, removeSession, resetTableScore, createOption, createTableQuizzes, createDivAnswer }
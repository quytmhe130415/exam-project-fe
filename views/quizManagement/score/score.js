const btn_quizzes = document.querySelector('#btn_Quizzes');
const btn_Student = document.querySelector('#btn_Student');
const btn_Logout = document.querySelector('#btn_Logout');
const { ipcRenderer } = require('electron');
const { removeSession, resetTableScore } = require('../../createElement.js');
const btn_subject = document.querySelector('#btn_Subject')

btn_Student.disabled = true;

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

btn_subject.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('open-subject');
})



async function getAllStudent(allStuson) {
  const accTable = document.querySelector('#account');
  for (const student of allStuson) {
    const trStudent = document.createElement('tr');
    const tdName = document.createElement('td');
    const nameNode = document.createTextNode(`${student.userName}`)
    tdName.appendChild(nameNode)
    const tdShow = document.createElement('td');
    const btnShow = document.createElement('button');
    const btnNode = document.createTextNode('Show');


    btnShow.addEventListener('click', async (e) => {
      e.preventDefault();
      resetTableScore();
      console.log(student._id);
      const arrScore = await fetch(`http:localhost:3000/scoreOfStudent/${student._id}`);
      const arrScoreJson = await arrScore.json();
      console.log(arrScoreJson);

      const textName = document.querySelector('#studentName');
      textName.innerText = `Student Name : ${student.userName}`

      const scoreTable = document.querySelector('#score');

      for (const subject of arrScoreJson) {
        const trSubject = document.createElement('tr')

        const subjectName = document.createElement('td')
        const sjNode = document.createTextNode(`${subject.subjectId}`)
        subjectName.appendChild(sjNode)
        trSubject.appendChild(subjectName);

        const subjectScore = document.createElement('td')
        const scoreNode = document.createTextNode(`${subject.score}`)
        subjectScore.appendChild(scoreNode)
        trSubject.appendChild(subjectScore);

        const tdDate = document.createElement('td')
        const dateNode = document.createTextNode(`${subject.date}`)
        tdDate.appendChild(dateNode)
        trSubject.appendChild(tdDate);

        scoreTable.appendChild(trSubject)
      }

    })

    btnShow.appendChild(btnNode)
    tdShow.appendChild(btnShow)
    trStudent.appendChild(tdName);
    trStudent.appendChild(tdShow);

    accTable.appendChild(trStudent);
  };

}

ipcRenderer.send('students-fetching');


ipcRenderer.on('students-json', (_, studentsJson) => {
  getAllStudent(studentsJson);
})
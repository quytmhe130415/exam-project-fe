const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron')
const electronLocalshortcut = require('electron-localshortcut');
const { validateUserName } = require('./validateInput')
const fetch = require('node-fetch');
const PORT = 3000;
const ROOT_URL = `http://localhost:${PORT}`


let win = null;
let enterCode = null;

function createWindow() {
    win = new BrowserWindow({
        height: 400,
        width: 300,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });
    //win.webContents.openDevTools();
    win.loadFile('./views/login/index.html');
    win.removeMenu();

    ipcMain.on('accept-login-message', async(event, user) => {
        if (user.rule) {
            win.setResizable(true);
            win.setSize(1000, 700);
            win.center();
            win.loadFile('./views/quizManagement/score/score.html');
            event.reply('send-session', { userName: user.userName, rule: user.rule, id: user._id });
        } else {
            enterCode = new BrowserWindow({
                height: 200,
                width: 400,
                webPreferences: {
                    nodeIntegration: true
                },
                resizable: false
            });

            win.hide();
            enterCode.show();
            enterCode.removeMenu();
            enterCode.center();
            enterCode.loadFile('./views/testUi/loginCode/testLogin.html');
            enterCode.on('close', () => {
                win.show();
            })
        }
    })
}

app.whenReady().then(() => {
    createWindow();

    globalShortcut.register('Alt+Tab', () => {
        console.log('Alt+Tab is pressed')
    })

    electronLocalshortcut.register(win, 'Alt+Tab', () => {
        console.log('You pressed ctrl & R or F5');
    });

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})


ipcMain.on('open-Students', (event, session) => {
    if (session.rule == 1) {
        win.loadFile('./views/quizManagement/score/score.html')
    } else {
        return;
    }
})
ipcMain.on('open-Quizzes', (event, session) => {
    if (session.rule == 1) {
        win.loadFile('./views/quizManagement/quiz/quiz.html')
    } else {
        return;
    }
})
ipcMain.on('user-Logout', () => {
    win.setSize(300, 400)
        //win.setResizable(false)
    win.loadFile('./views/login/index.html');
})

ipcMain.on('students-fetching', async(event) => {
    const students = await fetch(`${ROOT_URL}/allStudent`, { method: 'GET' });
    const studentsJson = await students.json();

    event.reply('students-json', studentsJson)
})

ipcMain.on('ge  izzes', async(event, object) => {
    await fetch(`${ROOT_URL}/getAllQuizzes/`, {
        method: 'POST',
        body: JSON.stringify(object),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then((res) => {
        return res.json();
    }).then((quizzesJson) => {
        event.reply('quizzes-json', quizzesJson)
    }).catch(() =>
        console.log('fetch fail...!')
    )
})

ipcMain.on('get-subjects', async(event) => {
    const subjects = await fetch(`${ROOT_URL}/getSubjects/`, { method: 'GET' });
    const subjectsJson = await subjects.json();
    event.reply('subjects-json', subjectsJson)
})

let addFrame = null;
ipcMain.on('open-new-window', (_, isAdd) => {
    //win.hide();
    addFrame = new BrowserWindow({
        parent: win,
        modal: true,
        height: 400,
        width: 600,
        webPreferences: {
            nodeIntegration: true
        },

    });

    addFrame.flashFrame(true)


    addFrame.loadFile('./views/addQuiz/quizDetail.html');
    //addFrame.removeMenu()
    addFrame.webContents.once('dom-ready', () => {
        if (isAdd.isAdd) {
            addFrame.webContents.executeJavaScript(`
        require('./addQuiz.js');
      `)
        } else {
            ipcMain.once('get-quiz-edit', (event) => {
                event.reply('main-send-quiz-edit', { subjectCode: isAdd.subjectCode, quiz: isAdd.quiz })
            });
            addFrame.webContents.executeJavaScript(`
        document.title = 'Edit Quiz';
        require('./editQuiz.js');
      `)
        }
    })

    addFrame.on('close', () => {
        win.show();
    })
})
let sessions = null;

ipcMain.on('send-session', (event, session) => {
    sessions = session;
})

ipcMain.on('get-session', (event) => {

    event.reply('main-send-session', sessions)
})

ipcMain.on('fetch-post-quiz', async(event, quiz) => {
    await fetch(`${ROOT_URL}/postQuiz/`, {
        method: 'POST',
        body: JSON.stringify(quiz),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then((res) => {
        return res.json();
    }).then((status) => {
        if (status.status === 200) {
            dialog.showMessageBox({
                buttons: ["Yes", "No"],
                message: "Insert done, Do you really want to quit?"
            }).then((res) => {
                win.send('update-quiz');
                if (!res.response) {
                    addFrame.close();
                }
            })
        } else {
            throw new Error();
        }
    }).catch(() =>
        dialog.showMessageBox({
            message: "insert fail, please try again...!"
        })
    )
})


ipcMain.on('fetch-post-edit-quiz', async(event, quiz) => {
    await fetch(`${ROOT_URL}/updateQuiz/`, {
        method: 'PUT',
        body: JSON.stringify(quiz),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then((res) => {
        return res.json();
    }).then((status) => {
        if (status.status === 200) {
            dialog.showMessageBox({
                buttons: ["Yes", "No"],
                message: "Update done, Do you really want to quit?"
            }).then((res) => {
                win.send('update-quiz');
                if (!res.response) {
                    addFrame.close();
                }
            })
        } else {
            throw new Error();
        }
    }).catch(() =>
        dialog.showMessageBox({
            message: "update fail, please try again...!"
        })
    )
})


ipcMain.on('disable-enable-quiz', async(event, payload) => {
    await fetch(`${ROOT_URL}/disableQuiz/`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then((res) => {
        return res.json();
    }).then((status) => {
        if (status.status === 200) {
            win.send('update-quiz');
        } else {
            throw new Error();
        }
    }).catch(() => {})
})

ipcMain.on('login-fail', () => {
    dialog.showErrorBox('login', 'login fail, please try again...!')
})


let addSubject = null;
ipcMain.on('add-subject', () => {
    addSubject = new BrowserWindow({
        parent: win,
        modal: true,
        height: 200,
        width: 400,
        webPreferences: {
            nodeIntegration: true
        }
    });

    addSubject.loadFile('./views/addSubject/addSubject.html');

    addSubject.on('close', () => {
        win.show();
    })
});
let quizzes = null;
let examCode = null;
ipcMain.on('send-code-subject', async(event, code) => {

    const exam = await fetch(`${ROOT_URL}/getTestExam/${code}`, { method: 'GET' });
    const quizzesJson = await exam.json();
    if (quizzesJson) {
        examCode = code;
        win.show();
        enterCode.hide()
        win.loadFile('./views/testUi/examTest/examTest.html');
        win.setFullScreen(true)

        //win.setSize(1000, 700);
        //win.center();
        quizzes = quizzesJson;
    }
})

ipcMain.on('get-exam-code', (event) => {
    event.reply('main-sand-exam-code', examCode);
})

ipcMain.on('get-Quizzes', (event) => {
    if (quizzes) {
        event.reply('main-send-quizzes', quizzes);
    }
})

ipcMain.on('open-subject', (event) => {
    win.loadFile('./views/quizManagement/subject/subject.html')
})

ipcMain.on('save-subject', async(event, subject) => {
    await fetch(`${ROOT_URL}/addSubject/`, {
        method: 'POST',
        body: JSON.stringify(subject),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then((res) => {
        return res.json();
    }).then((status) => {
        if (status.status === 200) {
            dialog.showMessageBox({
                buttons: ["Yes", "No"],
                message: "insert done, Do you really want to quit?"
            }).then((res) => {
                win.send('update-subjects');
                if (!res.response) {
                    addSubject.close();
                }
            })
        } else {
            throw new Error();
        }
    }).catch(() => {

    })
})

ipcMain.on('delete-subject', async(event, subjectId) => {

    const choice = dialog.showMessageBoxSync(win, {
        type: "warning",
        buttons: ["yes", "no"],
        message: "If delete subject it will delete quizzes of this subject's exam",
        title: "Do you want to continues ?"
    })
    if (choice === 0) {
        const deleteSubject = await fetch(`${ROOT_URL}/delete/${subjectId}`, { method: 'DELETE' });
        if (deleteSubject.ok && deleteSubject.status === 200) {
            win.send('update-subjects');
        }
    }
})

ipcMain.on('finish-exam', async(event, exam) => {
        //! fetch exam method post
        await fetch(`${ROOT_URL}/postExam/${examCode}`, {
            method: 'POST',
            body: JSON.stringify(exam),
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }).then((res) => {
            return res.json();
        }).then((status) => {
            if (status.status === 200) {
                // dialog.showMessageBox({
                //   buttons: ["Yes", "No"],
                //   message: "Insert done, Do you really want to quit?"
                // }).then((res) => {
                //   win.send('update-quiz');
                //   if (!res.response) {
                //     addFrame.close();
                //   }
                // })
            } else {
                throw new Error();
            }
        }).catch(() =>
            dialog.showMessageBox({
                message: "submit fail, please try again...!"
            })
        )
    })
    //MAE101_WMSj9hlTkhKGJTjM
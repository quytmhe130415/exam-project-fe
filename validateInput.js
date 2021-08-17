function validateUserName(userName) {
  let check = RegExp('[\\d!@#$%^&*(),.?:{}|<>_+="]').test(userName);

  if (check) {
    check = false;
  }
  return check;
}

module.exports = { validateUserName }
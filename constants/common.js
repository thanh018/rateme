const FULLNAME = 'fullname';
const EMAIL = 'email';
const PASSWORD = 'password';
const USER_EXIST = 'User with email already exist';
const INCORRECT_EMAIL = 'Incorrect email';
const INCORRECT_PASSWORD = 'Incorrect password';
const EMAIL_REQUIRED = 'Email is required';
const PASSPORT_REQUIRED = 'Password is required';
const INVALID_EMAIL = 'Invalid email format';
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 20;
const FULLNAME_MIN = 5;
const PASSWORD_ERROR = `The password length must be between ${PASSWORD_MIN} and ${PASSWORD_MAX}`;
const FULLNAME_ERROR = `The fullname length must be larger than ${FULLNAME_MIN} characters`;


module.exports = {
  FULLNAME,
  EMAIL,
  PASSWORD,
  USER_EXIST,
  INCORRECT_EMAIL,
  INCORRECT_PASSWORD,
  EMAIL_REQUIRED,
  PASSPORT_REQUIRED,
  INVALID_EMAIL,
  PASSWORD_MIN,
  PASSWORD_MAX,
  PASSWORD_ERROR,
  FULLNAME_ERROR,
}
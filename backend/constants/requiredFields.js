const VERIFY_USER_EMAIL_REQUIRED_FIELDS = [ 
    { field : 'otp', label: 'OTP'}, 
];

const REGISTER_USER_REQUIRED_FIELDS = [ 
    { field : 'firstName', label: 'First name'}, 
    { field : 'lastName', label: 'Last name'}, 
    { field : 'email', label: 'Email'},
    { field : 'password', label: 'Password'}
];

const SIGNIN_REQUIRED_FIELDS = [ 
    { field : 'email', label: 'Email'}, 
    { field : 'password', label: 'Password'}, 
];

const REQUEST_RESET_PASSWORD_REQUIRED_FIELDS = [ 
    { field : 'email', label: 'Email'}, 
];

const RESET_PASSWORD_REQUIRED_FIELDS = [ 
    { field : 'password', label: 'Password'}, 
];

const REGISTER_GROUP_REQUIRED_FIELDS = [
    { field: 'name', label: 'Group Name' },
    { field: 'leader', label: 'Group Leader' },
];

module.exports = {
  VERIFY_USER_EMAIL_REQUIRED_FIELDS,
  SIGNIN_REQUIRED_FIELDS,
  REGISTER_USER_REQUIRED_FIELDS,
  REQUEST_RESET_PASSWORD_REQUIRED_FIELDS,
  RESET_PASSWORD_REQUIRED_FIELDS,
  
  REGISTER_GROUP_REQUIRED_FIELDS
}
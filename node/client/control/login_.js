function LoginHandler(setToken, readState) {
  let emailInput = document.getElementById('form-email-field');
  let gdprInput = document.getElementById('form-gdpr-field');
  let codeInput = document.getElementById('form-code-field');
  let emailButton = document.getElementById("login-button");
  let codeButton = document.getElementById("code-button");
  let backButton = document.getElementById("back-button");
  let emailForm = document.getElementById('email-form');
  let codeForm = document.getElementById('code-form');
  let login = document.getElementById("login");
  let logout = document.getElementById("logout");
  let error = document.getElementById('error');
  emailForm.onkeypress = (event) => keyClick_(emailButton, event);
  codeForm.onkeypress = (event) => keyClick_(codeButton, event);

  emailButton.addEventListener("click", () => {
    function emailSent_() {
      if (this.status != 200 && this.status != 429) {
        emailFailed();
        return;
      }
      error.innerHTML = '';
      emailForm.classList.add('hidden');
      codeForm.classList.remove('hidden');
    }
    function emailFailed_() {
      error.innerHTML = 'Could not send email to this address.';
    }

    let email = emailInput.value;
    let gdpr = gdprInput.checked;

    if (gdpr != true) {
      error.innerHTML = 'You have to allow your data to be stored.';
      return;
    }

    let emailReq = new XMLHttpRequest();
    emailReq.onload = emailSent_;
    emailReq.onerror = emailFailed_;
    emailReq.open("GET", window['NJUNIS_HOST'] + "/auth/login?gdpr=" + gdpr + '&email=' + email);
    emailReq.send();
  })

  codeButton.addEventListener("click", () => {
    function codeSent_() {
      if (this.status != 200) {
        codeFailed_();
        return;
      }
        error.innerHTML = 'Successfully logged in!';
      codeForm.classList.add('hidden');
      login.classList.add('hidden');
      logout.classList.remove('hidden');
      setToken(JSON.parse(this.response).session);
    }
    function codeFailed_() {
      error.innerHTML = 'Incorrect code.';
    }

    let email = emailInput.value;
    let code = codeInput.value;
    let codeReq = new XMLHttpRequest();
    codeReq.onload = codeSent_;
    codeReq.onerror = codeFailed_;
    codeReq.open("GET", window['NJUNIS_HOST'] + "/auth/code?code=" + code + '&email=' + email);
    codeReq.send();
  })

  backButton.addEventListener("click", () => {
    emailForm.classList.remove('hidden');
    codeForm.classList.add('hidden');
    error.innerHTML = '';
  })

  logout.addEventListener("click", () => {
    function logout_() {
      logout.classList.add('hidden');
      login.classList.remove('hidden');
      emailForm.classList.remove('hidden');
      codeForm.classList.add('hidden');
      error.innerHTML = '';
      emailInput.value = '';
      gdprInput.checked = false;
      codeInput.value = '';
      setToken('');
    }
    let token = readState.getToken();
    let revokeReq = new XMLHttpRequest();
    revokeReq.onload = logout_;
    revokeReq.onerror = logout_;
    revokeReq.open("GET", window['NJUNIS_HOST'] + "/auth/revoke?token=" + token);
    revokeReq.send();
  })
}

function keyClick_(button, event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    button.click();
    return true;
  }
}


module.exports = {LoginHandler};
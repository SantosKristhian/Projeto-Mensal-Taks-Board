 
const user = JSON.parse(localStorage.getItem("user"));

document.addEventListener('DOMContentLoaded', () => {
  if (user && user.email) {
    document.getElementById('email-display').innerText = ` ${user.email}`;
  } else {
    document.getElementById('email-display').innerText = "Email não encontrado.";
  }
});
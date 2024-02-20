import { login, logout } from "./login";
import { displayMap } from "./leaflet";
import { updateData } from "./updateSettings";

const leaflet = document.getElementById('map');
const loginForm = document.querySelector(".form--login");
const logoutButton = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data")

if(leaflet) {
  const locations = JSON.parse(leaflet.dataset.locations);
  displayMap(locations);
}

if(loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password)
  });
}

if(logoutButton) {
  logoutButton.addEventListener("click", logout);
}

if(userDataForm) {
  userDataForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    updateData(name, email)
  })
}

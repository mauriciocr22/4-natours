import { login, logout } from "./login"
import { displayMap } from "./leaflet";

const leaflet = document.getElementById('map');
const loginForm = document.querySelector(".form");
const logoutButton = document.querySelector(".nav__el--logout");

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


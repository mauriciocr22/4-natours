import { login } from "./login"
import { displayMap } from "./leaflet";

const leaflet = document.getElementById('map');
const loginForm = document.querySelector(".form")

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


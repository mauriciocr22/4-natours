import axios from "axios"
import { showAlert } from "./alert"

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: "POST",
      url: "http://localhost:3000/api/v1/users/login",
      data: {
        email,
        password
      }
    });
    if(result.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/")
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: "GET",
      url:  "http://localhost:3000/api/v1/users/logout"
    });

    if(result.data.status === "success") location.reload(true);
  } catch(err) {
    showAlert("error", "Error logging out! Try again.")
  }
}
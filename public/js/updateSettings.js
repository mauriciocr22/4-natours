import axios from "axios";
import { showAlert } from "./alert"

export const updateData = async (name, email) => {
  try {
    const response = await axios({
      method: "PATCH",
      url: "http://localhost:3000/api/v1/users/updateMe",
      data: {
        name,
        email
      }
    });

    if(response.data.status  === "success") {
      showAlert("success", "Data updated successfully!")
    }
  } catch(err) {
    showAlert("error", err.response.data.message);
  }
}
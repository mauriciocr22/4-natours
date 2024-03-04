import axios from "axios";
import { showAlert } from "./alert"

export const bookTour = async tourID => {
  try {
    const stripe = Stripe("pk_test_51OovU0Jb2PVhUHIs0LnIgfQgONYaoghIij7Vu461i4LoistPBOkhVhS6vM8dJCkpKrbWFo343r3dhQUbW0ASM3e900uVrrHQtf");
    const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourID}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
}
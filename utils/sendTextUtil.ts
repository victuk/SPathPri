import axios from "axios";
import "dotenv/config";


export const sendTextMessages = async (phoneNumber: string | string[], message: string) => {
  try {

    // if(process.env.ENV != "production") return;
    
    await axios.post("https://v3.api.termii.com/api/sms/send/bulk", {
        api_key: process.env.TERMII_API_KEY,
        to: phoneNumber,
        from: "DominionSch",
        sms: message,
        type: "plain",
        channel: "generic",
      });

  } catch (error) {
    console.log(error);
  }
}

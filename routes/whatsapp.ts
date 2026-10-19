import "dotenv/config"
import { Router } from "express";
import { WhatsappService } from "../utils/whatsappService";
import axios from "axios";

const whatsappWebhookRoute = Router();

const sendMessage = async (to: string, message: string) => {
  return await axios.post("https://wasenderapi.com/api/send-message", {
      to,
      text: message || "Invalid request, kindly try again."
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WASENDER_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
    });
}

whatsappWebhookRoute.post("/whatsapp", async (req, res, next) => {
  const sender = req.body.data.messages.key.cleanedSenderPn;
  try {
    const incomingMessage = req.body.data.messages.messageBody;
    
    const wsServiceResponse = new WhatsappService(sender, incomingMessage, sendMessage);
    const v = await wsServiceResponse.execution();

    await sendMessage(sender, v as string);
    
    res.status(200).send("Successful!");
  } catch (error: any) {
    await sendMessage(sender, "An error occurred, please try again later.");
    next(error);
  }
});

export default whatsappWebhookRoute;

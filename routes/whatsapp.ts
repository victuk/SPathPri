import { Router } from "express";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";
import { WhatsappService } from "../utils/whatsappService";

const whatsappWebhookRoute = Router();

whatsappWebhookRoute.post("/whatsapp", async (req, res) => {
  const incomingMessage = req.body.Body;
  const fromNumber = req.body.From;

  console.log(fromNumber, incomingMessage);

  const twiml = new MessagingResponse();

  const wsServiceResponse = new WhatsappService(fromNumber, incomingMessage);

  const v = await wsServiceResponse.execution();

  console.log(v);

  twiml.message(v || "Invalid response");

  res.type('text/xml').send(twiml.toString());
});

export default whatsappWebhookRoute;

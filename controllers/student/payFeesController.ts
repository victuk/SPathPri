import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import axios from "axios";

require('dotenv').config();
const payStackSecretKey = process.env.PAYSTACK_KEY;

async function verifyPayment(req: CustomRequest, res: Response, next: NextFunction) {
    const { referenceID, paymentDetails } = req.body;
    // const { id } = req.decoded;

    try {
        const response = await axios.get(
            "https://api.paystack.co/transaction/verify/" + referenceID,
            {
              headers: {
                Authorization: "Bearer " + payStackSecretKey,
              },
            }
          );

          res.status(200).json({response});
          
        //   const electionDetails = await election.findById(electionID)
        //   .populate("adminID", "fullName email verified schoolName");
    } catch (error) {
        res.status(400).json({
            message: 'Payment failed.'
        });
    }
}

export = {
    verifyPayment
};

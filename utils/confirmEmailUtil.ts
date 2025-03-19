import { OTPCollection } from "../models/otpManager";
import { genOTP } from "./authUtilities";
import { sendEmail } from "./emailUtilities";

interface SendConfirmEmail {
    email: string;
    fullName: string;
    userId: string;
    userType: "student" | "teacher" | "schooladmin";
    sentVia: "sms" | "email";
    purpose: "verifyemail" | "verifyphonenumber" | "resetpassword";
}

interface ReturnInterface {
    isSuccessful: boolean;
    token: string | null;
    error: null | unknown;
}

export const sendConfirmEmail = async ({
    email, fullName, userId, userType, sentVia, purpose
}: SendConfirmEmail): Promise<ReturnInterface>  => {

    try {
        
        const otp = genOTP();

        const otpObject = await OTPCollection.create({
          userId: userId,
          userType: userType,
          otp,
          sentVia,
          purpose
        });

        if(sentVia == "email") {

            const emailOption = {
              to: email,
              subject: "Confirm Email - Verbicle",
              body: `<div>
            <h1>Confirm OTP</h1>
            <div>Hello ${fullName}, your OTP is <strong>${otp}</strong></div>
          </div>`,
            };
    
            await sendEmail(emailOption);
        } else if (sentVia == "sms") {
            console.log("------------------- Implement sending sms --------------------");
        }


        return {
            isSuccessful: true,
            token: otpObject.id,
            error: null
        };

    } catch (error) {
        return {
            isSuccessful: false,
            error,
            token: null
        };
    }

    
}
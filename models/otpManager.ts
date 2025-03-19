import {Schema, InferSchemaType, model} from "mongoose";

const OTPSchema = new Schema({
    userId: {
        type:String,
        required: true
    },
    userType: {
        type:String,
        enum: ["student", "teacher", "schooladmin"],
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    sentVia: {
        type: String,
        enum: ["email", "sms"],
        required: true
    },
    purpose: {
        type: String,
        enum: ["verifyemail", "verifyphonenumber", "resetpassword"],
        required: true
    }
}, {timestamps: true});

type OTPCollectionType = InferSchemaType<typeof OTPSchema>;

const OTPCollection = model("OTPs", OTPSchema);

export {OTPCollection, OTPCollectionType};
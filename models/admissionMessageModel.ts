import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const admissionMessageSchema = new Schema({
    message: String,
    admissionStartDate: Date,
    admissionEndDate: Date,
    year: String
},
{ timestamps: true });

const admissionMessage = mongoose.model('admissionMessage', admissionMessageSchema);

export { admissionMessage };
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const feesSchema = new Schema({
    studentID: {
        type: Schema.Types.ObjectId, ref: 'users',
        required: true
    },
    amount: Number,
    referenceID: String,
    term: {
        type: String,
        enum: ['first-term', 'second-term', 'third-term']
    },
    studentClass: {
        type: String,
        enum: ['js1', 'js2', 'js3', 'ss1', 'ss2', 'ss3']
    },
    year: String,
    payDate: Date,
    metaDetails: Object,
    splitDetails: Object
},
{ timestamps: true });

const schoolFees = mongoose.model('schoolFees', feesSchema);

export { schoolFees };
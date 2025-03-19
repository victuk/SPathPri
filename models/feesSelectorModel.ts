import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const feesSelectorSchema = new Schema({
    editedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    amount: Number,
    studentClass: {
        type: String,
        enum: ['js1', 'js2', 'js3', 'ss1', 'ss2', 'ss3']
    },
    bordingFee: {
        type: Number,
        default: 0
    },
    extraLesson: {
        type: Number,
        default: 0
    },
    schoolBus: {
        type: Number,
        default: 0
    }
},
{ timestamps: true });

const schoolFeesSelector = mongoose.model('schoolFeesSelector', feesSelectorSchema);

export { schoolFeesSelector };
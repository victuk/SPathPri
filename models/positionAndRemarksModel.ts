import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const positionAndRemarks = new Schema({
    studentID: {
        type: Schema.Types.ObjectId, ref: 'users',
        required: true
    },
    classTeacher: {
        type: Schema.Types.ObjectId, ref: 'users',
        required: true
    },
    studentClass: {
        type: String,
        enum: ['js1', 'js2', 'js3', 'ss1', 'ss2', 'ss3']
    },
    term: {
        type: String,
        enum: ['first-term', 'second-term', 'third-term']
    },
    principalRemarks: {
        type: String,
        default: "No Remarks"
    },
    position: {
        type: String,
        default: "Not set"
    },
    studentAverage: {
        type: Number,
        default: 0
    },
    totalSubjectScores: {
        type: Number,
        default: 0
    },
    numberOfSubjectsOffered: {
        type: Number,
        default: 0
    },
    year: String
},
{ timestamps: true });

const studentPositionAndRemark = mongoose.model('positionAndRemarks', positionAndRemarks);

export { studentPositionAndRemark };
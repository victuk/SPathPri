import { Schema, InferSchemaType, model, Types } from "mongoose";
import paginate from "mongoose-paginate-v2";

const AttendanceSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
    },
    term: {
      type: String,
      enum: ["first-term", "second-term", "third-term"],
      required: true,
    },
    reasonForAbsence: {
        type: String,
        default: null
    },
    year: {
      type: String,
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "schoolclasses",
      required: true,
    },
    schoolId: {
      type: Types.ObjectId,
      ref: "schoolprofile",
      default: null,
    },
    status: {
      type: String,
      enum: ["absent", "present", "permitted-absence"],
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "staffs",
      required: true,
    },
  },
  { timestamps: true }
);

type AttendanceCollectionType = InferSchemaType<typeof AttendanceSchema>;

AttendanceSchema.plugin(paginate);

const AttendanceCollection = model("attendance", AttendanceSchema);

export { AttendanceCollection, AttendanceCollectionType };

import { v4 } from "uuid";
import { schoolProfileCollection } from "../models/schoolProfile";
import { studentsCollection } from "../models/students";
import { staffsCollection } from "../models/staffs";

export const createSchoolId = async (schoolName: string) => {
    const newSchoolUId = schoolName.slice(0, 3) + "-" + v4().split("-")[1] + "sch";
    const schoolExists = await schoolProfileCollection.findOne({schoolUid: newSchoolUId});
    if(schoolExists) {
        createSchoolId(schoolName);
    } else {
        return newSchoolUId;
    }
}

export const createStudentId = async (schoolUid: string) => {
    const thisYear = (new Date().getFullYear()).toString().slice(2);
    const newStudentId = schoolUid + "/" + "stu" + thisYear + "/" + v4().split("-")[1];
    const studentIdExists = await studentsCollection.findOne({studentUid: newStudentId});

    if(studentIdExists) {
        createStudentId(schoolUid);
    } else {
        return newStudentId;
    }

}

export const createStaffId = async (schoolUid: string) => {
    const thisYear = (new Date().getFullYear()).toString().slice(2);
    const newStaffId = schoolUid + "/" + "sta" + thisYear + "/" + v4().split("-")[1];
    const studentIdExists = await staffsCollection.findOne({staffUid: newStaffId});
    if(studentIdExists) {
        createStaffId(schoolUid);
    } else {
        return newStaffId;
    }
}
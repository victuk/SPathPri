import { resultCollectionType } from "../models/resultModel";

export const resultRemarks = (studentAverage: number, data: resultCollectionType[]) => {

    // console.log(resultDetails);
    // console.log(data);

    let principalsRemark = "";

    let classTeachersRemark = "";

    // console.log("studentAverage", studentAverage);

    if(studentAverage <= 100 && studentAverage >= 88) {
        principalsRemark = "An outstanding performance";
        classTeachersRemark = "Excellent result";
    } else if(studentAverage <= 87 && studentAverage >=60) {
        principalsRemark = "A good performance";
        classTeachersRemark = "Good performance";
    } else if (studentAverage <= 59 && studentAverage >= 50) {
        principalsRemark = "An average performance";
        classTeachersRemark = "Average performance";
    } else if(studentAverage <= 49 && studentAverage >= 45) {
        principalsRemark = "A fair performance";
        classTeachersRemark = "Fair result";
    } else if( studentAverage <= 44) {
        principalsRemark = "A poor performance";
        classTeachersRemark = "Poor performance";
    }


    const subjectsToImproveOn = data?.filter((r: resultCollectionType) => r?.grade != null && r?.subjectAverage != null && r?.testsAndExamTotal < 50).map((r: any) => r?.subjectId?.subject);

    // console.log("subjectsToImproveOn", subjectsToImproveOn);

    if(subjectsToImproveOn.length > 0) {
        if(subjectsToImproveOn.length > 3) {
            principalsRemark + `. Spend quality time to improve on your weak subjects.`
        } else {
            principalsRemark + `. Spend quality time to improve on ${subjectsToImproveOn.join(", ")}.`
        }
    }

    return {
        principalsRemark,
        classTeachersRemark
    };

}
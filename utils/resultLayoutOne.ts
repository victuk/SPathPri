import moment from "moment"
import { schoolProfileCollectionType } from "../models/schoolProfile"
import { studentsCollectionType } from "../models/students"
import { resultCollectionType } from "../models/resultModel"

export const resultHeaderTable = (schoolDetails: schoolProfileCollectionType, studentDetails: any) => {
    return `
        <table style="width: 100%; margin-bottom: 5px;" border="1">
          <tr>
            <td style="width: 10%;"><div style="text-align: center; padding: 5px">
              <img src='${schoolDetails?.schoolLogo}' style="width: 40px; height: 40px; border-radius: 5px;" />
            </div></td>
            <td style="width: 80%">
            <div style="text-align: center">
                <div style="font-weight: bold; font-size: 20px;">${schoolDetails?.schoolName.toLocaleUpperCase()}</div>
              <div style="font-size: 14px;">${schoolDetails?.schoolMotto}</div>
              <div style="font-size: 14px;">${schoolDetails?.location}</div>
            </div>
            </td>
            <td style="width: 10%;"><div style="text-align: center; padding: 5px;">
              <img src='${
                studentDetails?.profilePic ? studentDetails?.profilePic : "/avatar.jpg"
              }' style="width: 40px; height: 40px; border-radius: 5px;" />
            </div></td>
          </tr>
          </table>
    `
}


export const studentAndResultDetailsTable = (
    studentDetails: any,
    schoolClass: any[],
    result: any,
    role: string,
    term: string,
    year: string,
    classSize: number,
    isSpecialClass: boolean
    ) => {
    return `
        <table style="width: 100%; margin-bottom: 5px; font-size: 12px;" border="1">
          <tr>
            <td><div style="padding: 5px;">Full Name: ${
              studentDetails?.firstName
            } ${studentDetails?.otherNames} ${studentDetails?.surname}</div></td>
            <td><div style="padding: 5px;">Student ID: ${
              studentDetails?.studentUid
            }</div></td>
            <td><div style="padding: 5px;">Term: ${term
              .toLocaleUpperCase()
              .split("-")
              .join(" ")}</div></td>
              <td><div style="padding: 5px;">Session: ${year}</div></td>
              </tr>
              <tr>
              <td><div style="padding: 5px;">Class: ${
                role != "student"
                  ? schoolClass.find((c: any) => c._id == studentDetails?.classId._id)?.schoolClass
                  : studentDetails?.classId?.schoolClass
              }</div></td>
            <td><div style="padding: 5px;">Position: ${isSpecialClass ? "--" : (result?.position ? result?.position : "--")}</div></td>
            <td><div style="padding: 5px;">Verdict: ${(result?.verdict)?.toLocaleUpperCase()}</div></td>
            <td><div style="padding: 5px;">Class Size: ${classSize}</div></td>
            </tr>
            <tr>
            <td><div style="padding: 5px;">Total Class(es) Held: ${result?.totalClassesHeld}</div></td>
            <td><div style="padding: 5px;">Total Present Class(es): ${result?.totalStudentPresence}</div></td>
            <td><div style="padding: 5px;">Total Absent Class(es): ${result?.totalStudentAbsence}</div></td>
            <td><div style="padding: 5px;">Opening Date: ${result?.openingDate ? moment(result?.openingDate).format("LL") : "Not Set"}</div></td>
            </tr>
          </table>
    `;
}


export const subjectAndPositionTable = (response: resultCollectionType[] | any[]) => {
    return `
        <table style="width: 100%; margin-bottom: 5px;" border="1">
              <tr>
                <th colspan="10"><div style="font-weight: bold; width: 100%; font-size: 12px; padding: 5px;">COGNITIVE DOMAIN</div></th>
              </tr>
                  <tr>
                      <th style="padding: 5px;"><div style="font-size: 12px;">S/N</div></th>
                      <th style="padding: 5px;"><div style="font-size: 12px;">Subject</div></th>
                      <th style="padding: 5px;"><div style="font-size: 12px;">CAT</div></th>
                      <!-- <th style="padding: 5px;"><div style="font-size: 12px;">CAT 2</div></th> -->
                      <!-- <th style="padding: 5px;"><div style="font-size: 12px;">CAT 3</div></th> -->
                      <th style="padding: 5px;"><div style="font-size: 12px;">Exam</div></th>
                      <th style="padding: 5px;"><div style="font-size: 12px;">Total (100%)</div></th>
                      <th style="padding: 5px;"><div style="font-size: 12px;">Grade</div></th>
                      <!-- <th style="padding: 5px;"><div style="font-size: 12px;">Subject Average</div></th> -->
                      <th style="padding: 5px;"><div style="font-size: 12px;">Subj. Pos.</div></th>
                      <th style="padding: 5px;"><div style="font-size: 12px;">Remark</div></th>
                  </tr>
                  ${response
                    // .filter((r: resultCollectionType) => r?.grade != null && r?.subjectAverage != null)
                    .map(
                      (d: resultCollectionType | any, index: number) =>
                        `<tr style="padding: 4px; font-size: 12px;">
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center; width: 100%;">${index + 1}</div></td>
                            <td style="paddng: 5px;"><div style="padding: 2px; width: 100%;">${d?.subjectId?.subject}</div></td>
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.testOne + d?.testTwo + d?.testThree}</div></td>
                            <!-- <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.testTwo}</div></td> -->
                            <!-- <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.testThree}</div></td> -->
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.examScore}</div></td>
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.testsAndExamTotal}</div></td>
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.grade}</div></td>
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.subjectPosition}</div></td>
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center; color: ${d?.remark == "Fail" ? "red" : "black"};">${d?.remark}</div></td>
                        </tr>`
                    )
                    .join("")}
              </table>
    `;
}


export const gradingSystemTable = (schoolDetails: schoolProfileCollectionType, result: any, response: any) => {
    return `
        <table style="width: 100%; margin-bottom: 5px; font-size: 12px;" border="1">
                <tr>
                      <td style="font-weight: bold; padding: 5px;">Student's total mark: ${result?.studentSubjectTotal} / ${response
                        // ?.filter((r: resultCollectionType) => r?.grade != null && r?.subjectAverage != null)
                        ?.length * 100}</td>
                      <td style="font-weight: bold; padding: 5px;">Student's average mark: ${result?.studentSubjectAverage}</td>
                    </tr>
                    </table>
                    <table style="width: 100%; margin-bottom: 5px; font-size: 12px;" border="1">
                    ${
                      schoolDetails?.gradingSystem == "grading-system-1" ? (
                        `
                              <tr>
                                  <td colspan="6" style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">GRADING SYSTEM</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px;">80 to 100 - A</td>
                                <td style="padding: 5px;">70 to 79 - B</td>
                                <td style="padding: 5px;">60 to 69 - C</td>
                                <td style="padding: 5px;">50 to 59 - D</td>
                                <td style="padding: 5px;">40 to 49 - E</td>
                                <td style="padding: 5px;">0 to 39 - F</td>
                              </tr>
                              `
                            ) : ""
                          }
                          ${
                      schoolDetails?.gradingSystem == "grading-system-2" ? (
                        `
                              <tr>
                                  <td colspan="4" style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">GRADING SYSTEM</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px;">80 to 100 - A</td>
                                <td style="padding: 5px;">60 to 79 - B</td>
                                <td style="padding: 5px;">50 to 59 - C</td>
                                <td style="padding: 5px;">0 to 49 - F</td>
                              </tr>
                              `
                            ): ""
                          }
                        </table>
                        
    `;
}

export const behaviourAssessmentTable = (filteredBehaviour: any) => {
    return `
        <table style="width: 100%; margin-bottom: 0;" border="1">
                          <tr>
                            <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">BEHAVIOUR ASSESSMENT</td>
                          </tr>
                        </table>
              <div style="display: flex">
              <table style="width: 100%; margin-bottom: 5px;" border="1">
                
                <tr>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">AFFECTIVE ASSESSMENT</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">A</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">B</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">C</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">D</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">E</td>
                </tr>
                ${
                  filteredBehaviour?.aff?.map((p: any) => (
                    `
                    <tr style="font-size: 12px;">
                      <td style="padding: 5px;">${p?.title}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "A" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "B" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "C" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "D" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "E" ? `<div>&check;</div>` : "<div></div>"}</td>
                    </tr>`  
                    )).join("")
                  }
                  
              </table>

              <table style="width: 100%; margin-bottom: 5px;" border="1">
                <tr>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">PSYCHOMOTOR ASSESSMENT</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">A</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">B</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">C</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">D</td>
                  <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">E</td>
                </tr>
                ${
                  filteredBehaviour?.psy?.map((p: any) => (
                    `<tr style="font-size: 12px;">
                      <td style="padding: 5px;">${p?.title}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "A" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "B" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "C" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "D" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p?.score == "E" ? `<div>&check;</div>` : "<div></div>"}</td>
                      </tr>`
                    )).join("")
                  }
              </table>
              </div>
    `;
}

export const classTeacherAndPrincipalRemarkTable = (result: any, response: any) => {
    return `
       <table style="width: 100%; margin-bottom: 5px; font-weight: 12px;" border="1">
                           <tr style="font-size: 12px;">
                             <td style="font-weight: bold; width: 140px;">Class teacher's remark</td>
                             <td style="padding: 5px;">${result?.classTeacherRemark}.</td>
                           </tr>
                           <tr style="font-size: 12px;">
                             <td style="font-weight: bold; width: 140px;">Principal's remark</td>
                             <td style="padding: 5px;">${result?.principalsRemark}. ${result?.includeWeakSubjects ? `${response.filter((r: any) => r.testsAndExamTotal < 50).length > 0 ? `Spend quality time to improve on ${response?.filter((r: any) => r?.testsAndExamTotal < 50).map((r: any) => r?.subjectId?.subject).join(", ")}.` : "Spend quality time to improve on your weak subjects."}` : ""}</td>
                           </tr>
                     </table> 
    `;
}



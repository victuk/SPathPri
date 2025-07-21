import puppeteer from "puppeteer";
import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { resultCollection, resultCollectionType } from "../models/resultModel";
import { schoolTemplateCollection } from "../models/schoolTemplateModel";
import { studentsCollection } from "../models/students";
import { schoolProfileCollection } from "../models/schoolProfile";
import { schoolClassCollection } from "../models/classModel";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { resultRemarks } from "../utils/remarksUtil";
import { classTeacherAffectiveAssessmentCollection } from "../models/classTeacherAffectiveAssessment";
import moment from "moment";

export const studentResultList = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await classPositionAndRemarksCollection
    .find({studentId: req.userDetails?.userId})
    .select("studentClass term year").populate("studentClass");
    res.send({
      result
    });
  } catch (error) {
    next(error);
  }
}

export const generatePDF = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { htmlContent } = req.body;
    //   const it = `
    //         <html>
    //             <body>
    //                 ${htmlContent}
    //             </body>
    //         </html>
    //   `

    const fileName = v4() + ".pdf";

    // console.log("htmlContent", htmlContent);
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load" });
    // await page.waitForSelector('#contentReady', { timeout: 10000 });
    const pdfBuffer = await page.pdf();
    await browser.close();

    const publicFolderPath = path.join(__dirname, "../public");
    const pdfFilePath = path.join(publicFolderPath, fileName);

    fs.writeFileSync(pdfFilePath, pdfBuffer);

    res.send({
      fileName,
    });
  } catch (error) {
    next(error);
  }
};

export const generateResultV2 = async (
  userId: string, schoolId: string, role: string, term: string, year: string, classId: string
) => {

    const query: any = {};

    const schoolDetails = await schoolProfileCollection.findById(
      schoolId
    );

    const studentDetails: any = await studentsCollection.findById(
      userId
    ).populate("classId");

    const schoolClass = await schoolClassCollection.find({
      schoolId
    });

    query.studentId = userId;
    query.studentClass = classId;
    query.term = term;
    query.year = year;

    const response = await resultCollection
      .find(query)
      .populate("studentId", "-password")
      .populate("teacherId", "-password")
      .populate("subjectId")
      .populate("studentClass");

      if(response.length == 0) {
        throw new Error("No record found");
      }

    const stamp = await schoolTemplateCollection.findOne({
      templateType: "result-stamp",
      schoolId: schoolId,
    });

    const classSize = await studentsCollection
      .find({
        classId,
        schoolId: schoolId,
      })
      .countDocuments();

      const result = await classPositionAndRemarksCollection.findOne({
        studentId: userId,
        studentClass: classId,
        year,
        term,
      });

      const behaviour = await classTeacherAffectiveAssessmentCollection.findOne({
        studentId: userId,
        studentClass: classId,
        year,
        term,
      });

      const filteredBehaviour: any = {
        aff: [],
        psy: []
      };

      let behaviourLength = 0;

      if(behaviour) {
        behaviourLength = behaviour.classTeacherAffectiveAssessments.length;

        for(let i = 0; i < behaviourLength; i++) {
          let b = behaviour.classTeacherAffectiveAssessments[i];
          if(b.type == "Affective domain") {
            filteredBehaviour.aff.push(b);
          }

          if(b.type == "Psychomotor domain") {
            filteredBehaviour.psy.push(b);
          }
        }
      }

      const specialClass: string[] = process.env.EXCLUDE_POSITION as any;

      const isSpecialClass = specialClass.includes(classId);

      const remarks = resultRemarks(result!!.studentSubjectAverage, response);

      const element = `
          <div style="padding: 10px; font-size: 8px;">
          <style>
            table, th, td {
              border-collapse: collapse;
            }
            .cog {
              background-color: green;
              color: white;
            }
          </style>

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
            <td><div style="padding: 5px;">Position: ${result?.position ? result?.position : "--"}</div></td>
            <td><div style="padding: 5px;">Class Size: ${classSize}</div></td>
            <td><div style="padding: 5px;">Opening Date: ${result?.openingDate ? moment(result?.openingDate).format("LL") : "Not Set"}</div></td>
            </tr>
            <tr>
              <td><div style="padding: 5px;">Total Class(es) Held: ${result?.totalClassesHeld}</div></td>
              <td><div style="padding: 5px;">Total Present Class(es): ${result?.totalStudentPresence}</div></td>
              <td><div style="padding: 5px;">Total Absent Class(es): ${result?.totalStudentAbsence}</div></td>
            </tr>
          </table>

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
                      <th style="padding: 5px;"><div style="font-size: 12px;">Subject Position</div></th>
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
                            <td style="paddng: 5px;"><div style="padding: 2px; text-align: center;">${d?.remark}</div></td>
                        </tr>`
                    )
                    .join("")}
              </table>

              <table style="width: 100%; margin-bottom: 5px; font-size: 12px;" border="1">
                <tr>
                      <td style="font-weight: bold; padding: 5px;">Student's total mark: ${result?.studentSubjectTotal} / ${response
                        // ?.filter((r: resultCollectionType) => r?.grade != null && r?.subjectAverage != null)
                        ?.length * 100}</td>
                      <td style="font-weight: bold; padding: 5px;">Student's average mark: ${result?.studentSubjectAverage}</td>
                    </tr>
              </table>
                        <table style="width: 100%; margin-bottom: 5px;" border="1">
                          <tr>
                            <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">BEHAVIOUR ASSESSMENT</td>
                          </tr>
                        </table>

                         ${isSpecialClass ? (
                `<table style="width: 100%; margin-bottom: 5px; font-size: 12px;" border="1">
              <tr>
                      <th style="padding: 5px;"><div style="padding: 5px; font-weight: bold;">SUBJECT</div></th>
                      <th style="padding: 5px;"><div style="padding: 5px; font-weight: bold;">TEST</div></th>
                      <th style="padding: 5px;"><div style="padding: 5px; font-weight: bold;">PROJECT</div></th>
                      <th style="padding: 5px;"><div style="padding: 5px; font-weight: bold;">EXAM</div></th>
                      <th style="padding: 5px;"><div style="padding: 5px; font-weight: bold;">TOTAL</div></th>
                  </tr>
                <tr>
                      <td style="padding: 5px;">Hand writing</td>
                      <td style="padding: 5px;">${result?.handWriting?.test}</td>
                      <td style="padding: 5px;">${result?.handWriting?.project}</td>
                      <td style="padding: 5px;">${result?.handWriting?.exams}</td>
                      <td style="padding: 5px;">${result?.handWriting?.total}</td>
                </tr>
                <tr>
                      <td style="padding: 5px;">CCA</td>
                      <td style="padding: 5px;">${result?.CCA?.test}</td>
                      <td style="padding: 5px;">${result?.CCA?.project}</td>
                      <td style="padding: 5px;">${result?.CCA?.exams}</td>
                      <td style="padding: 5px;">${result?.CCA?.total}</td>
                </tr>
                <tr>
                      <td style="padding: 5px;">Rhymes</td>
                      <td style="padding: 5px;">${result?.rhymes?.test}</td>
                      <td style="padding: 5px;">${result?.rhymes?.project}</td>
                      <td style="padding: 5px;">${result?.rhymes?.exams}</td>
                      <td style="padding: 5px;">${result?.rhymes?.total}</td>
                </tr>
              </table>`
              ) : ""}

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
                  filteredBehaviour.aff.map((p: any) => (
                    `
                    <tr style="font-size: 12px;">
                      <td style="padding: 5px;">${p.title}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "A" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "B" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "C" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "D" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "E" ? `<div>&check;</div>` : "<div></div>"}</td>
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
                  filteredBehaviour.psy.map((p: any) => (
                    `<tr style="font-size: 12px;">
                      <td style="padding: 5px;">${p.title}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "A" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "B" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "C" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "D" ? `<div>&check;</div>` : "<div></div>"}</td>
                      <td style="font-weight: bold; padding: 5px; font-size: 12px; text-align: center;">${p.score == "E" ? `<div>&check;</div>` : "<div></div>"}</td>
                      </tr>`
                    )).join("")
                  }
              </table>
              </div>

              <table style="width: 100%; margin-bottom: 5px; font-weight: 12px;" border="1">
                    <tr style="font-size: 12px;">
                      <td style="font-weight: bold; width: 140px;">Class teacher's remark</td>
                      <td style="padding: 5px;">${remarks.classTeachersRemark}</td>
                    </tr>
                    <tr style="font-size: 12px;">
                      <td style="font-weight: bold; width: 140px;">Principal's remark</td>
                      <td style="padding: 5px;">${remarks.principalsRemark}</td>
                    </tr>
              </table>
              <div style="padding: 5px; text-align: right;"><img src="${stamp?.fileLink}" style="height: 100px; border-radius: 5px;"></div>
            </div>
        `;

      const fileName = v4() + ".pdf";

    // console.log("htmlContent", htmlContent);
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(element, { waitUntil: "load" });
    // await page.waitForSelector('#contentReady', { timeout: 10000 });
    const pdfBuffer = await page.pdf();
    await browser.close();

    const publicFolderPath = path.join(__dirname, "../public");
    const pdfFilePath = path.join(publicFolderPath, fileName);

    fs.writeFileSync(pdfFilePath, pdfBuffer);

    return fileName;

};

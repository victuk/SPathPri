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
import { behaviourAssessmentTable, classTeacherAndPrincipalRemarkTable, gradingSystemTable, resultHeaderTable, studentAndResultDetailsTable, subjectAndPositionTable } from "../utils/resultLayoutOne";

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

              ${resultHeaderTable(schoolDetails!!, studentDetails)}

          ${studentAndResultDetailsTable(
            studentDetails,
            schoolClass,
            result!!,
            role,
            term,
            year,
            classSize
          )}

              ${subjectAndPositionTable(response)}

              ${gradingSystemTable(schoolDetails!!, result, response)}

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

              ${behaviourAssessmentTable(filteredBehaviour)}

              ${classTeacherAndPrincipalRemarkTable(result, response)}

              
              
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













































































































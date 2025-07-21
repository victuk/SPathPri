import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { resultCollection } from "../models/resultModel";
import { schoolProfileCollection } from "../models/schoolProfile";
import { studentsCollection } from "../models/students";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";

export const generateTranscript = async (studentId: string, schoolId: string) => {
    try {

        const studentDetails = await studentsCollection.findById(studentId);

        const schoolDetails = await schoolProfileCollection.findById(schoolId);
        
        const position = await classPositionAndRemarksCollection.find({studentId, schoolId}).sort({createdAt: -1});

        const results = await resultCollection.find({studentId, schoolId}).populate("studentId", "-password")
      .populate("teacherId", "-password")
      .populate("subjectId")
      .populate("studentClass");;

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
                <table style="width: 100%; margin-bottom: 20px;" border="1">
                    <tr>
                        <td>School Name: ${schoolDetails?.schoolName}</td>
                        <td>Student's Name: ${studentDetails?.firstName} ${studentDetails?.otherNames} ${studentDetails?.surname}</td>
                    </tr>
                </table>
                ${
                    position.map((p) => `
                        <table style="width: 100%; margin-bottom: 5px;" border="1">
                            <tr>
                                <td>Position: ${p?.position}</td>
                                <td>Term: ${p?.term.replace(/-/g, " ").toLocaleUpperCase()}</td>
                                <td>Term: ${p?.year}</td>
                                <td>Student's average: ${p?.studentSubjectAverage}</td>
                            </tr>
                        </table>
                        <table style="width: 100%; margin-bottom: 20px;" border="1">
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
                            ${
                                results.filter(r => r.term == p.term && r.year == p.year).map((d: any, index) => `
                                    <tr style="padding: 4px; font-size: 12px;">
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
                                    </tr>
                                `).join("")
                            }
                        </table>
                    `).join("")
                }
            </div>
        `;

        const fileName = `${schoolDetails?.schoolName} transcript ${v4()}.pdf`;
        
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

    } catch (error: any) {
        throw new Error(error);
    }
}

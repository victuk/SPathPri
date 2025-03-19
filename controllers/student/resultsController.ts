import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { schoolFees } from "../../models/feesModel";
import { result } from "../../models/resultModel";
import { resultRemark } from "../../utils/userUtil";

async function getResult(req: CustomRequest, res: Response, next: NextFunction) {
  const { year, term, studentClass } = req.body;
  const studentID = req.userDetails?.userId;

  // console.log(req.body);
  // console.log(studentID);

  let studentR = [];

  const paidFees = await schoolFees.findOne(
    {
      studentID,
      studentClass,
      term,
      year,
    },
    "term studentClass year payDate"
  );

  if (!paidFees) {
    res.status(401).json({
      message: "No schoolfees paid",
    });
  } else {
    const studentResults = await result
      .find({
        studentID,
        studentClass,
        term,
        year,
      })
      .populate("teacherID", "firstName surname otherNames gender").populate("subjectID");

    if (studentResults.length == 0) {
      res.status(404).json({
        studentResults: studentResults,
        message: "No result yet",
      });

    } else {
      for (let studentResult of studentResults) {
        const resRem = resultRemark(studentResult.testsAndExamTotal);
        const result: any = JSON.parse(JSON.stringify(studentResult));
        
        result.grade = resRem.grade;
        result.remark = resRem.remark;
        studentR.push(result);
      }

      res.json({
        studentResults: studentR,
      });
    }
  }
}

export {
  getResult
};

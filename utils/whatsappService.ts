import { generateResultV2 } from "../controllers/generatePDFController";
import { schoolClassCollection } from "../models/classModel";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { resultCollection } from "../models/resultModel";
import { StudentsScratchCardCollection } from "../models/studentsScratchCard";
import { whatsappSessionCollection } from "../models/whatsappService";

export class WhatsappService {
  id: string;
  incomingMessage: string;

  constructor(id: string, incomingMessage: string) {
    this.id = id;
    this.incomingMessage = incomingMessage;
  }

  async getSession() {
    return await whatsappSessionCollection.findOne({ sessionId: this.id });
  }

  async execution() {
    const session = await this.getSession();

    if (this.incomingMessage.toLocaleLowerCase() == "cancel") {
      await whatsappSessionCollection.deleteMany({ sessionId: this.id });
      return "Session reset successful. You can start over again."
    }

    if (!session) {
      if (this.incomingMessage == "1") {
        await whatsappSessionCollection.create({
          sessionId: this.id,
          step: "check-result",
          subStep: "start",
        });
        return "Enter your scratch card registration number";
      } else {
        return "Hello there, welcome to Solvpath result checker. Send 1 to check your result. At any time send 'cancel' to start again.";
      }
    } else if (session) {
      if (session.step == "check-result") {
        if (session.subStep == "start") {
        //   const sessionDetails = await whatsappSessionCollection.findOne({
        //     sessionId: this.id,
        //   });

          const studentDetails = await StudentsScratchCardCollection.findOne({
            scratchCardId: this.incomingMessage,
          });

          console.log("Student Details", studentDetails);

          const schoolClasses = await classPositionAndRemarksCollection
            .find({
                studentId: studentDetails?.studentId,
              term: studentDetails?.term,
              year: studentDetails?.year,
              schoolId: studentDetails?.schoolId,
            })
            .populate("studentClass");

          await whatsappSessionCollection.findOneAndUpdate(
            {
              sessionId: this.id,
            },
            {
              subStep: "choose-class",
              form: {
                studentId: studentDetails?.studentId!,
                schoolId: studentDetails?.schoolId!,
                role: "student",
                term: studentDetails?.term,
                year: studentDetails?.year,
              },
            },
          );

          console.log("schoolClasses 1", schoolClasses);

          return `
            Choose a class below (respond with a number):\n\n${schoolClasses.map((sc: any, index) =>`${index + 1}. ${sc?.studentClass.schoolClass} result`).join("\n\n")}`;
        } else if (session.subStep == "choose-class") {
          const sessionDetails = await whatsappSessionCollection.findOne({
            sessionId: this.id,
          });


          console.log("session details", sessionDetails?.form);

          const schoolClasses = await classPositionAndRemarksCollection.find({
            term: sessionDetails?.form?.term,
            year: sessionDetails?.form?.year,
            schoolId: sessionDetails?.form?.schoolId,
            studentId: sessionDetails?.form?.studentId,
          });

          console.log("schoolClasses", schoolClasses);

          if(schoolClasses.length == 0) {
            return "No result for this class";
          }

          const classChosen: any =
            schoolClasses[parseInt(this.incomingMessage as string) - 1];

            console.log("classChosen", classChosen);

          const result = await generateResultV2(
            sessionDetails?.form?.studentId!,
            sessionDetails?.form?.schoolId!,
            "student",
            sessionDetails?.form?.term,
            sessionDetails?.form?.year,
            classChosen.studentClass,
          );

          console.log("Result", result);

          return `https://d1odfy-ip-197-211-52-71.tunnelmole.net/${result}`;
        }
      }
    }
  }
}

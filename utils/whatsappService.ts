import { generateResultV2 } from "../controllers/generatePDFController";
import { schoolsCollection } from "../models/_schoolCollection";
import { schoolClassCollection } from "../models/classModel";
import { classPositionAndRemarksCollection } from "../models/classPositionAndRemarksModel";
import { resultCollection } from "../models/resultModel";
import { schoolProfileCollection } from "../models/schoolProfile";
import { studentsCollection } from "../models/students";
import { StudentsScratchCardCollection } from "../models/studentsScratchCard";
import { whatsappSessionCollection } from "../models/whatsappService";
import axios from "axios";

export class WhatsappService {
  id: string;
  incomingMessage: string;
  sendMessage: (to: string, message: string) => Promise<axios.AxiosResponse<any, any, {}>>;

  constructor(id: string, incomingMessage: string, sendMessage: (to: string, message: string) => Promise<axios.AxiosResponse<any, any, {}>>) {
    this.id = id;
    this.incomingMessage = incomingMessage;
    this.sendMessage = sendMessage;
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
      } else if (this.incomingMessage == "2") {
        await whatsappSessionCollection.create({
          sessionId: this.id,
          step: "check-newsletter",
          subStep: "start",
        });
        return "Enter your scratch card registration number";
      } else {
        await whatsappSessionCollection.deleteMany({ sessionId: this.id });
        return [
          "Welcome to Solvpath Whatsapp Assistant\n",
          "Respond with",
          "'1' to check your result",
          "'2' to view your school's newsletter. \n",
          "At any time send 'cancel' to start again.",
        ].join("\n");
      }
    } else if (session) {

      if (this.incomingMessage.toLocaleLowerCase() == "start") {
        await whatsappSessionCollection.deleteMany({ sessionId: this.id });
        return [
          "Welcome to Solvpath Whatsapp Assistant\n",
          "Respond with",
          "'1' to check your result",
          "'2' to view your school's newsletter. \n",
          "At any time send 'cancel' to start again.",
        ].join("\n");
      }

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
            Choose a class below (respond with a number):\n\n${schoolClasses.map((sc: any, index) => `${index + 1}. ${sc?.studentClass.schoolClass} result`).join("\n\n")}`;
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

          if (schoolClasses.length == 0) {
            return "No result for this class";
          }

          const classChosen: any =
            schoolClasses[parseInt(this.incomingMessage as string) - 1];

          console.log("classChosen", classChosen);

          // await this.sendMessage(this.id, "Generating your result. Please wait...");

          const result = await generateResultV2(
            sessionDetails?.form?.studentId!,
            sessionDetails?.form?.schoolId!,
            "student",
            sessionDetails?.form?.term,
            sessionDetails?.form?.year,
            classChosen.studentClass,
          );

          const studentDetails = await studentsCollection.findById(sessionDetails?.form?.studentId!);
          const schoolDetails = await schoolProfileCollection.findById(sessionDetails?.form?.schoolId!);
          const studentClassDetails = await schoolClassCollection.findById(classChosen.studentClass);
          await whatsappSessionCollection.deleteMany({ sessionId: this.id });
          return [
            `Dear ${studentDetails?.firstName} ${studentDetails?.otherNames} ${studentDetails?.surname},\n`,
            `Welcome to ${schoolDetails?.schoolName}. Your result for ${studentClassDetails?.schoolClass} ${sessionDetails?.form?.term} term, ${sessionDetails?.form?.year} academic session is ready.`,
            `Please click the link below to download your result. \n ${process.env.WHATSAPP_BASE_URL}/${result}`,
            `\n`,
            `Yours Sincerely,`,
            `Solvpath Global Limited`,
          ].join("\n");
        }
      } else if (session.step == "check-newsletter") {
        const scratchCardDetails = await StudentsScratchCardCollection.findOne({
          scratchCardId: this.incomingMessage,
        });

        const studentDetails = await studentsCollection.findById(scratchCardDetails?.studentId!);

        const schoolDetails = await schoolProfileCollection.findById(studentDetails?.schoolId!);

        await whatsappSessionCollection.deleteMany({ sessionId: this.id });

        if(!schoolDetails?.newsletterUrl) {
          return [
          `Dear ${studentDetails?.firstName} ${studentDetails?.otherNames} ${studentDetails?.surname},`,
          `Welcome to ${schoolDetails?.schoolName}. `,
          `A newsletter has not been uploaded yet for ${schoolDetails?.schoolName}, please try again later, thank you.`,
          `\n\n`,
          `Yours Sincerely,`,
          `Solvpath Global Limited`,
        ].join("\n");
        }

        return [
          `Dear ${studentDetails?.firstName} ${studentDetails?.otherNames} ${studentDetails?.surname},`,
          `Welcome to ${schoolDetails?.schoolName}. `,
          `Please click the link below to view the newsletter. \n\n ${schoolDetails?.newsletterUrl}`,
          `\n\n`,
          `Yours Sincerely,`,
          `Solvpath Global Limited`,
        ].join("\n");

      }
    }
  }
}

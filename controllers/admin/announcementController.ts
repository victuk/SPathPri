import { announcementSch } from "../../models/announcementModel";
import { transporter } from "../../utils/userUtil";
import { usersDB } from "../../models/usersModel";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { NextFunction, Response } from "express";

async function sendTheMail(options: any) {
  try {
    await transporter.sendMail(options);
  } catch (error) {
    console.log('An error occoured while trying to send the mail.');
  }
}

async function sendToParents(title: string, body: string, edited: any) {

  const details = await usersDB.find(
    { role: "student" },
    "parentName parentEmail"
  );

  for (let u of details) {
    var mailOptions = {
      from: "School <no-reply@school.com>",
      to: u.parentEmail,
      subject: `${title} ${edited ? '(Edited)' : ''} - School`,
      html: `
                      <div style="padding: 20px">
                          <h1 style="background-color: blue; white: color: white;">Message From School</h1>
                          <h2>${title} ${edited ? '(Edited)' : ''} </h2> <br><br>
                            Dear Mr./Mrs. ${u.parentName} <br>
                            <div>
                            ${body}
                            </div>
                          <style>
                                div, a {
                                  padding: 20px 10px;
                                }
                          </style>
                      </div>
                      `,
    };

    sendTheMail(mailOptions);
  }
}

async function sendToUsers(title: string, body: string, audienceType: string, edited: any) {
  if(audienceType == 'teacher') {

    const teachers = await usersDB.find({ role: "teacher" }, "firstName surName otherNames email gender");

    for (let u of teachers) {
      var mailOptions = {
        from: "School <no-reply@school.com>",
        to: u.email,
        subject: `${title} ${edited ? '(Edited)' : ''}  - School`,
        html: `
                        <div style="padding: 20px">
                            <h1 style="background-color: blue; white: color: white;">Message From School</h1>
                            <h2>${title} ${edited ? '(Edited)' : ''} </h2> <br><br>
                              Dear ${u.gender == 'male' ? 'Mr.' : 'Miss/Mrs.'} ${u.firstName} ${u.otherNames} ${u.surname},<br>
                              <div>
                              ${body}
                              </div>
                            <style>
                                  div, a {
                                    padding: 20px 10px;
                                  }
                            </style>
                        </div>
                        `,
      };
  
      sendTheMail(mailOptions);
    }

  } else if(audienceType == 'student') {

    const students = await usersDB.find({ role: "student" }, "firstName surName otherNames email gender");

    for (let u of students) {
      var mailOptions = {
        from: "School <no-reply@school.com>",
        to: u.email,
        subject: `${title} ${edited ? '(Edited)' : ''} - School`,
        html: `
                        <div style="padding: 20px">
                            <h1 style="background-color: blue; white: color: white;">Message From School</h1>
                            <h2>${title} ${edited ? '(Edited)' : ''} </h2> <br><br>
                              Dear ${u.gender == 'male' ? 'Master' : 'Miss'} ${u.firstName} ${u.otherNames} ${u.surname} <br>
                              <div>
                              ${body}
                              </div>
                            <style>
                                  div, a {
                                    padding: 20px 10px;
                                  }
                            </style>
                        </div>
                        `,
      };
  
      sendTheMail(mailOptions);
    }
  }
}

async function createAnnouncement(req: CustomRequest, res: Response, next: NextFunction) {

  try {
    
    const { title, announcement, audienceType } = req.body;
  
    const postedBy = req.userDetails?.userId;
  
    const edited = false;
  
    const newAnn = await announcementSch.create({
      postedBy,
      announcementTitle: title,
      announcement: announcement,
      audienceType,
    });
  
    if (audienceType != "everyone") {
      const role = audienceType.slice(0, audienceType.length - 1);
      if(audienceType == 'teachers') {
        sendToUsers(title, announcement, role, edited);
      } else if (audienceType == 'students') {
        sendToUsers(title, announcement, role, edited);
      } else if((audienceType == 'parents')) {
        sendToParents(title, announcement, edited);
      }
    } else {
      sendToUsers(title, announcement, "teacher", edited);
      sendToUsers(title, announcement, "student", edited);
      sendToParents(title, announcement, edited);
    }
  
    res.json({
      message: "Announcemnt created.",
      newAnnouncement: newAnn
    });

  } catch (error) {
    next(error);
  }
}

async function getAllAnnouncements(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    
    const allAnn = await announcementSch.find();
    res.json({
      allAnnouncement: allAnn,
    });

  } catch (error) {
    next(error);
  }
}

async function editSpecificAccouncement(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    
    const {title, announcement, audienceType} = req.body;
    const {id: postID} = req.params;
  
    const edited = true;
  
    await announcementSch.findByIdAndUpdate(postID, {
      title,
      announcement,
    });
  
    if (audienceType != "everyone") {
      const role = audienceType.slice(0, audienceType.length - 1);
      if(audienceType == 'teachers') {
        sendToUsers(title, announcement, role, edited);
      } else if (audienceType == 'students') {
        sendToUsers(title, announcement, role, edited);
      } else if((audienceType == 'parents')) {
        sendToParents(title, announcement, edited);
      }
    } else {
      sendToUsers(title, announcement, "teacher", edited);
      sendToUsers(title, announcement, "student", edited);
      sendToParents(title, announcement, edited);
    }
  
    res.json({
      message: "Edit and resend successful."
    });

  } catch (error) {
    next(error);
  }
}

async function specificAnnouncement(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    
    const { id } = req.params;
  
    const specificAnn = await announcementSch.findById(id);
    res.json({
      specificAnnouncement: specificAnn,
    });

  } catch (error) {
    next(error);
  }
}



async function deleteSpecificAnnouncement(req: CustomRequest, res: Response, next: NextFunction) {
  const { id } = req.params;

  try {
    await announcementSch.findByIdAndDelete(id);
    res.json({
      status: "Deleted",
    });
  } catch (error) {
    next(error);
  }
}

export {
  createAnnouncement,
  getAllAnnouncements,
  specificAnnouncement,
  deleteSpecificAnnouncement,
  editSpecificAccouncement
};

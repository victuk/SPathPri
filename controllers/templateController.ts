import { NextFunction, Response } from "express";
import { CustomRequest } from "../middleware/authenticatedUsersOnly";
import { staffsCollection } from "../models/staffs";
import { schoolProfileCollection } from "../models/schoolProfile";
import { schoolTemplateCollection } from "../models/schoolTemplateModel";
import Joi from "joi";

export const getSchoolTemplates = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    

    const templates = await schoolTemplateCollection.find({
      schoolId: req.userDetails?.schoolId,
    }).populate("uploadedById", "firstName surname role");

    res.send({
      message: "Templates fetched successfully",
      result: templates,
    });
  } catch (error) {
    next(error);
  }
};

export const getTemplateByType = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const {templateType} = req.params;

    const result = await schoolTemplateCollection.findOne({templateType, schoolId: req.userDetails?.schoolId});

    res.send({result});

  } catch (error) {
    next(error);
  }
}

export const uploadSchoolTemplate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { templateType, fileLink } = req.body;

    const {error} = Joi.object({
      templateType: Joi.string().valid("assignment-template", "curriculum-template", "result-stamp", "terminal-news-letter").required().messages({
        "string.valid": `Template type can be either "assignment-template", "curriculum-template", "result-stamp" or "terminal-news-letter"`,
        "any.required": "Template type is required"
      }),
      fileLink: Joi.string().uri().required().messages({
        "string.url": "File link should be a valis url",
        "any.required": "File link is required"
      })
    }).validate(req.body);

    if(error) {
      res.status(400).send({
        errorMessage: error.message
      });
      return;
    }

    const staffDetails = await staffsCollection.findById(
      req.userDetails?.userId
    );

    const templateExists = await schoolTemplateCollection.findOne({
      schoolId: req.userDetails?.schoolId,
      templateType,
    });

    if (templateExists) {
      await schoolTemplateCollection.findByIdAndUpdate(templateExists._id, {
        fileLink,
      });
    } else {
      await schoolTemplateCollection.create({
        uploadedById: req.userDetails?.userId,
        templateType,
        fileLink,
        schoolId: req.userDetails?.schoolId,
      });
    }

    res.send({
      message: "Template updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSchoolTemplate = async (
    req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
    try {
        
        const {id} = req.params;

        if(!id) {
          res.status(400).send({
            errorMessage: "School template ID is required."
          });
        }

        const deletedFile = await schoolTemplateCollection.findByIdAndDelete(id);

        res.send({
            message: "File deleted successfully",
            result: deletedFile
        });

    } catch (error) {
        next(error);
    }
}

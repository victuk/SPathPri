import { NextFunction, Response } from "express";
import { CustomRequest } from "../../middleware/authenticatedUsersOnly";
import { settings } from "../../models/settingsModel";

async function set(req: CustomRequest, res: Response, next: NextFunction) {
  
  try {
    const { currentTerm, currentYear } = req.body;
    await settings.create({
      currentTerm,
      currentYear,
    });

    res.json({
      message: "Publish Successful."
    });
  } catch (error) {
    next(error);
  }
}

async function edit(req: CustomRequest, res: Response, next: NextFunction) {
  
  try {
    const { currentTerm, currentYear } = req.body;
  
    const { id:settingsID } = req.params;

    await settings.findByIdAndUpdate(
      settingsID,
      {
        currentTerm,
        currentYear,
      },
      {
        new: true,
      }
    );

    res.json({
      message: "Update Successful."
    });
  } catch (error) {
    next(error);
  }
}

async function fetchSetting(req: CustomRequest, res: Response, next: NextFunction) {
    const termYearSetting = await settings.find();

    res.send(termYearSetting);
}

export {
    set, edit, fetchSetting
};

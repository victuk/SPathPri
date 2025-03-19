
import { Router, Response, Request, NextFunction } from 'express';
import {CustomRequest, authenticatedUsersOnly} from '../../middleware/authenticatedUsersOnly';
import * as statusCodes from 'readable-http-codes';
import { noteCategoryCollection } from '../../models/noteCategory';

const adminRoutes = Router({
    caseSensitive: false,
    mergeParams: true,
    // Local strict routing
    strict: false,
});

adminRoutes.get("/note-categories", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const noteCategories = await noteCategoryCollection.find({teacherId: req.userDetails?.userId});

        res.json(noteCategories);

    } catch (error) {
        next(error);
    }
});

adminRoutes.post("/note-category", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const newCategory = await noteCategoryCollection.create(req.body);
        res.send({
            message: "created",
            newCategory
        });
    } catch (error) {
        next(error);
    }
});

adminRoutes.patch("/note-category/:id", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const updatedCategory = await noteCategoryCollection.findByIdAndUpdate(req.params.id, req.body, {new: true});

        res.send({
            message: "edited",
            updatedCategory
        });
    } catch (error) {
        next(error);
    }
});

adminRoutes.delete("/note-category/:id", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const updatedCategory = await noteCategoryCollection.findByIdAndDelete(req.params.id);

        res.send({
            message: "deleted",
            updatedCategory
        });
    } catch (error) {
        next(error);
    }
});

export default adminRoutes;
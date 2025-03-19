import { Router, Response, Request, NextFunction } from 'express';
import * as statusCodes from 'readable-http-codes';
import { CustomRequest } from '../../middleware/authenticatedUsersOnly';
import { AssessmentCollection } from '../../models/studentsAssessment';

const adminRoutes = Router({
    caseSensitive: false,
    mergeParams: true,
    // Local strict routing
    strict: false,
});

adminRoutes.get("/assessment", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const assessments = await AssessmentCollection.find({teacherId: req.userDetails?.userId});

        res.send(assessments);

    } catch (error) {
        next(error);
    }
});

adminRoutes.put("/assessment/:id", async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        
        const newAssessment = await AssessmentCollection.findByIdAndUpdate(req.params.id, req.body, {new: true});

        res.send(newAssessment);

    } catch (error) {
        next(error);
    }
});

export default adminRoutes;
import { CustomRequest } from "../middleware/authenticatedUsersOnly";

export const getSchoolId = (req: CustomRequest) => {
    return req.userDetails?.role == "super-admin" ? req.headers.schoolId : req.userDetails?.schoolId;
}
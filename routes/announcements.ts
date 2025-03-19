import express from 'express';
var router = express.Router();
import { authenticatedUsersOnly } from '../middleware/authenticatedUsersOnly';
// import { isRestricted } from '../authenticationMiddlewares/isRestricted';
import {
    getGeneralAnnouncement,
    specificAudienceAnnouncement
} from '../controllers/announcementsController';

router.get('/general', getGeneralAnnouncement);

router.use(authenticatedUsersOnly);
// router.use(isRestricted);

router.get('/specific-audience', specificAudienceAnnouncement);


export default router;

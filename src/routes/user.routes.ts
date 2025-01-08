
import { Router } from 'express';
import { enableDisableUserAccount, trackBorrowedBooksAndFines, viewUserDetails } from '../controllers/user.controller';
import { isUser } from '../middleware/auth.middleware';

const router = Router();

router.route(":/:userId").get(isUser, viewUserDetails)
router.route("/:userId/borrowed-books").get(isUser, trackBorrowedBooksAndFines)
router.route("/:userId/status").put(isUser, enableDisableUserAccount)


export default router;

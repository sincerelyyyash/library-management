
import { Router } from 'express';
import { enableDisableUserAccount, trackBorrowedBooksAndFines, viewUserDetails } from '../controllers/user.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.route(":/:userId").get(verifyJWT, viewUserDetails)
router.route("/:userId/borrowed-books").get(verifyJWT, trackBorrowedBooksAndFines)
router.route("/:userId/status").put(verifyJWT, enableDisableUserAccount)


export default router;


import { Router } from 'express';
import { enableDisableUserAccount, trackBorrowedBooksAndFines, viewUserDetails } from '../controllers/user.controller';

const router = Router();

router.route(":/:userId").get(viewUserDetails)
router.route("/:userId/borrowed-books").get(trackBorrowedBooksAndFines)
router.route("/:userId/status").put(enableDisableUserAccount)


export default router;


import { Router } from 'express';
import { generateInvoice, payFine } from '../controllers/payment.controller';
import { isUser } from '../middleware/auth.middleware';

const router = Router();

router.route('/pay-fine').post(isUser, payFine)
router.route('/generate-invoice').post(isUser, generateInvoice)

export default router;

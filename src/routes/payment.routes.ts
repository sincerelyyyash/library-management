
import { Router } from 'express';
import { generateInvoice, payFine } from '../controllers/payment.controller';
import { verifyJWT } from '../middleware/auth.middleware';

const router = Router();

router.route('/pay-fine').post(verifyJWT, payFine)
router.route('/generate-invoice').post(verifyJWT, generateInvoice)

export default router;

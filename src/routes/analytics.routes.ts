
import { Router } from 'express';
import { generateMonthlyUsageReport } from '../controllers/analytics.controller';
import { isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.route('/monthly-usage-report').get(isAdmin, generateMonthlyUsageReport)

export default router;

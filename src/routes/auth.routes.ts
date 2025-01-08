import { Router } from 'express';
import { register, signin } from '../controllers/auth.controller';

const router = Router();

router.route("/signup").post(register)

router.route("/signin").post(signin)

export default router;

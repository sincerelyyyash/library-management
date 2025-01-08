"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route('/pay-fine').post(auth_middleware_1.verifyJWT, payment_controller_1.payFine);
router.route('/generate-invoice').post(auth_middleware_1.verifyJWT, payment_controller_1.generateInvoice);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route('/monthly-usage-report').get(auth_middleware_1.isAdmin, analytics_controller_1.generateMonthlyUsageReport);
exports.default = router;

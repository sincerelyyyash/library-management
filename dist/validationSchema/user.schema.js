"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableDisableUserSchema = void 0;
const zod_1 = require("zod");
exports.enableDisableUserSchema = zod_1.z.object({
    isEnabled: zod_1.z.boolean(),
});

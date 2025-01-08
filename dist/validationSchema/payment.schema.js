"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoiceSchema = exports.payFineSchema = void 0;
const zod_1 = require("zod");
exports.payFineSchema = zod_1.z.object({
    userId: zod_1.z.number().int(),
    borrowedBookId: zod_1.z.number().int(),
});
exports.generateInvoiceSchema = zod_1.z.object({
    userId: zod_1.z.number().int(),
});

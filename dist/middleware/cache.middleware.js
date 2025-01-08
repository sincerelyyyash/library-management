"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default();
const cacheMiddleware = (duration) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = yield redis.get(key);
    if (cachedResponse) {
        res.send(JSON.parse(cachedResponse));
        return;
    }
    const originalSend = res.send;
    res.send = function (body) {
        redis.set(key, JSON.stringify(body), 'EX', duration);
        return originalSend.call(this, body);
    };
    next();
});
exports.default = cacheMiddleware;

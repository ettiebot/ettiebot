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
Object.defineProperty(exports, "__esModule", { value: true });
class History {
    constructor(redis) {
        this.redis = redis;
    }
    push(key, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = [];
            const redisVal = yield this.redis.get("history/" + key);
            if (!redisVal)
                data = [payload];
            else {
                data = JSON.parse(redisVal);
                if (data.length > 50)
                    data = data.splice(0, data.length - 1);
                data.push(payload);
            }
            yield this.redis.set("history/" + key, JSON.stringify(data));
            return data;
        });
    }
    deleteKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.redis
                .del(key)
                .then(() => true)
                .catch(() => false);
        });
    }
}
exports.default = History;

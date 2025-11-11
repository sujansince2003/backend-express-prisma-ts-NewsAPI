"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ioredis_1 = require("ioredis");
var Redisclient = new ioredis_1.Redis();
exports.default = Redisclient;

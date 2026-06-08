"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const applicationController_1 = __importDefault(require("../controllers/applicationController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, auth_1.requireRole)('student'));
router.post('/', applicationController_1.default.create);
router.get('/', applicationController_1.default.list);
router.get('/statistics', applicationController_1.default.statistics);
router.get('/ranking', applicationController_1.default.ranking);
router.get('/:id', applicationController_1.default.get);
router.put('/:id', applicationController_1.default.update);
router.delete('/:id', applicationController_1.default.delete);
exports.default = router;
//# sourceMappingURL=applications.js.map
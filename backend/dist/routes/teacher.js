"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teacherController_1 = __importDefault(require("../controllers/teacherController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, auth_1.requireRole)('teacher'));
router.post('/import-students', teacherController_1.default.importStudents);
router.get('/students', teacherController_1.default.getStudents);
router.get('/students/overview', teacherController_1.default.getStudentsOverview);
router.post('/create-student', teacherController_1.default.createStudentAccount);
router.put('/students/:id', teacherController_1.default.updateStudentAccount);
router.delete('/students/:id', teacherController_1.default.deleteStudentAccount);
router.get('/classes', teacherController_1.default.getClasses);
router.get('/statistics/class/:className', teacherController_1.default.getClassStatistics);
router.get('/statistics/overall', teacherController_1.default.getOverallStatistics);
router.get('/applications', teacherController_1.default.getAllApplications);
router.get('/applications/export', teacherController_1.default.exportApplications);
exports.default = router;
//# sourceMappingURL=teacher.js.map
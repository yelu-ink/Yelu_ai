"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const teacherService_1 = __importDefault(require("../services/teacherService"));
const config_1 = __importDefault(require("../config"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = config_1.default.upload.dir;
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: config_1.default.upload.maxSize },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.csv', '.xlsx', '.xls'];
        const extname = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(extname)) {
            cb(null, true);
        }
        else {
            cb(new Error('只支持 CSV 和 Excel 文件'));
        }
    },
});
class TeacherController {
    static getUploadMiddleware() {
        return upload.single('file');
    }
    static async importStudents(req, res) {
        try {
            const teacherId = req.user.id;
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: '请上传文件',
                });
            }
            const XLSX = await Promise.resolve().then(() => __importStar(require('xlsx')));
            const workbook = XLSX.readFile(req.file.path);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const students = [];
            for (const row of data) {
                if (row.name && row.className) {
                    students.push({
                        name: row.name,
                        className: row.className,
                    });
                }
            }
            if (students.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '文件中没有有效的学生数据',
                });
            }
            const result = await teacherService_1.default.importAuthorizedStudents(students, teacherId);
            fs_1.default.unlinkSync(req.file.path);
            res.json({
                success: true,
                message: `成功导入 ${result.length} 条学生记录`,
                data: {
                    count: result.length,
                },
            });
        }
        catch (error) {
            console.error('导入失败:', error);
            res.status(400).json({
                success: false,
                message: error.message || '导入失败',
            });
        }
    }
    static async getStudentsOverview(req, res) {
        try {
            const teacherId = req.user.id;
            const students = await teacherService_1.default.getStudentsOverview(teacherId);
            res.json({
                success: true,
                data: students,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取学生概览失败',
            });
        }
    }
    static async getStudents(req, res) {
        try {
            const teacherId = req.user.id;
            const { className } = req.query;
            const students = await teacherService_1.default.getManagedStudents(teacherId, className);
            res.json({
                success: true,
                data: students,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取学生名单失败',
            });
        }
    }
    static async getClasses(req, res) {
        try {
            const teacherId = req.user.id;
            const classNames = await teacherService_1.default.getClassNames(teacherId);
            res.json({
                success: true,
                data: classNames,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取班级列表失败',
            });
        }
    }
    static async getClassStatistics(req, res) {
        try {
            const teacherId = req.user.id;
            const { className } = req.params;
            const stats = await teacherService_1.default.getClassStatistics(className, teacherId);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取统计数据失败',
            });
        }
    }
    static async getOverallStatistics(req, res) {
        try {
            const teacherId = req.user.id;
            const stats = await teacherService_1.default.getOverallStatistics(teacherId);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取统计数据失败',
            });
        }
    }
    static async getAllApplications(req, res) {
        try {
            const teacherId = req.user.id;
            const filters = req.query;
            const applications = await teacherService_1.default.getAllApplications(teacherId, filters);
            res.json({
                success: true,
                data: applications,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取投递记录失败',
            });
        }
    }
    static async exportApplications(req, res) {
        try {
            const teacherId = req.user.id;
            const filters = req.query;
            const applications = await teacherService_1.default.getAllApplications(teacherId, filters);
            const exportData = applications.map((app) => ({
                学生姓名: app.user?.name,
                班级: app.user?.className,
                投递公司: app.company,
                投递岗位: app.position,
                投递时间: app.applicationDate,
                投递渠道: app.channel,
                类型: app.type,
                进展: app.status,
                进展时间: app.statusDate,
                地点: app.location,
                内推码: app.referralCode,
                重视度: app.priority,
                备注: app.remarks,
            }));
            const XLSX = await Promise.resolve().then(() => __importStar(require('xlsx')));
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '投递记录');
            const fileName = `投递记录导出_${new Date().toISOString().split('T')[0]}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            res.send(buffer);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '导出失败',
            });
        }
    }
    static async createStudentAccount(req, res) {
        try {
            const { name, major, studentLink } = req.body;
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: '请填写学生姓名',
                });
            }
            const result = await teacherService_1.default.createStudentAccount(name, major, studentLink);
            res.json({
                success: true,
                message: '学生账号创建成功',
                data: {
                    ...result,
                    name: name.trim(),
                    major: result.className,
                },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '创建学生账号失败',
            });
        }
    }
}
exports.TeacherController = TeacherController;
exports.default = TeacherController;
//# sourceMappingURL=teacherController.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const applicationService_1 = __importDefault(require("../services/applicationService"));
class ApplicationController {
    static async create(req, res) {
        try {
            const userId = req.user.id;
            const { company, position, applicationDate, channel, type, status, statusDate, location, referralCode, priority, remarks, } = req.body;
            if (!company || !position || !applicationDate) {
                return res.status(400).json({
                    success: false,
                    message: '请填写必填字段（公司、岗位、投递时间）',
                });
            }
            const application = await applicationService_1.default.createApplication(userId, {
                company,
                position,
                applicationDate,
                channel,
                type,
                status,
                statusDate,
                location,
                referralCode,
                priority,
                remarks,
            });
            res.status(201).json({
                success: true,
                message: '创建成功',
                data: application,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '创建失败',
            });
        }
    }
    static async list(req, res) {
        try {
            const userId = req.user.id;
            const filters = req.query;
            const applications = await applicationService_1.default.getUserApplications(userId, filters);
            res.json({
                success: true,
                data: applications,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取列表失败',
            });
        }
    }
    static async get(req, res) {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id, 10);
            const application = await applicationService_1.default.getApplicationById(id, userId);
            res.json({
                success: true,
                data: application,
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error.message || '获取记录失败',
            });
        }
    }
    static async update(req, res) {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id, 10);
            const updates = req.body;
            const application = await applicationService_1.default.updateApplication(id, userId, updates);
            res.json({
                success: true,
                message: '更新成功',
                data: application,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '更新失败',
            });
        }
    }
    static async delete(req, res) {
        try {
            const userId = req.user.id;
            const id = parseInt(req.params.id, 10);
            await applicationService_1.default.deleteApplication(id, userId);
            res.json({
                success: true,
                message: '删除成功',
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error.message || '删除失败',
            });
        }
    }
    static async ranking(req, res) {
        try {
            const userId = req.user.id;
            const data = await applicationService_1.default.getApplicationRanking(userId);
            res.json({
                success: true,
                data,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || '获取投递量排名失败',
            });
        }
    }
    static async statistics(req, res) {
        try {
            const userId = req.user.id;
            const stats = await applicationService_1.default.getStatistics(userId);
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
}
exports.ApplicationController = ApplicationController;
exports.default = ApplicationController;
//# sourceMappingURL=applicationController.js.map
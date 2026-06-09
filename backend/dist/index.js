"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("./config"));
const models_1 = require("./models");
const auth_1 = __importDefault(require("./routes/auth"));
const applications_1 = __importDefault(require("./routes/applications"));
const teacher_1 = __importDefault(require("./routes/teacher"));
const user_configs_1 = __importDefault(require("./routes/user-configs"));
const resources_1 = __importDefault(require("./routes/resources"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_2 = require("./models");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(config_1.default.upload.dir));
app.use('/api/auth', auth_1.default);
app.use('/api/applications', applications_1.default);
app.use('/api/teacher', teacher_1.default);
app.use('/api/user-configs', user_configs_1.default);
app.use('/api/resources', resources_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
if (config_1.default.nodeEnv === 'production') {
    const frontendDist = path_1.default.join(__dirname, '../../frontend/dist');
    app.use(express_1.default.static(frontendDist));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(frontendDist, 'index.html'));
    });
}
else {
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: '接口不存在',
        });
    });
}
app.use((err, req, res, next) => {
    console.error('错误:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器内部错误',
    });
});
const initializeApp = async () => {
    try {
        await (0, models_1.testConnection)();
        await (0, models_1.syncDatabase)();
        const adminExists = await models_2.User.findOne({ where: { username: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
            await models_2.User.create({
                username: 'admin',
                password: hashedPassword,
                name: '系统管理员',
                role: 'teacher',
            });
            console.log('已创建默认管理员账号：admin / admin123');
        }
        app.listen(config_1.default.port, '0.0.0.0', () => {
            console.log(`\n========================================`);
            console.log(`  学生投递记录管理系统已启动`);
            console.log(`  环境：${config_1.default.nodeEnv}`);
            console.log(`  本机访问：http://localhost:${config_1.default.port}`);
            console.log(`  局域网访问：http://192.168.30.230:${config_1.default.port}`);
            console.log(`========================================\n`);
        });
    }
    catch (error) {
        console.error('启动失败:', error);
        process.exit(1);
    }
};
initializeApp();
exports.default = app;
//# sourceMappingURL=index.js.map
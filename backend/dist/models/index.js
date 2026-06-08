"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.UserConfig = exports.Application = exports.AuthorizedStudent = exports.User = exports.syncDatabase = void 0;
const database_1 = __importDefault(require("../config/database"));
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const AuthorizedStudent_1 = __importDefault(require("./AuthorizedStudent"));
exports.AuthorizedStudent = AuthorizedStudent_1.default;
const Application_1 = __importDefault(require("./Application"));
exports.Application = Application_1.default;
const UserConfig_1 = __importDefault(require("./UserConfig"));
exports.UserConfig = UserConfig_1.default;
User_1.default.hasMany(Application_1.default, {
    foreignKey: 'userId',
    as: 'applications',
    onDelete: 'CASCADE',
});
Application_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
User_1.default.hasMany(AuthorizedStudent_1.default, {
    foreignKey: 'usedByUserId',
    as: 'managedStudents',
});
AuthorizedStudent_1.default.belongsTo(User_1.default, {
    foreignKey: 'usedByUserId',
    as: 'manager',
});
User_1.default.hasMany(User_1.default, {
    foreignKey: 'teacherId',
    as: 'students',
});
User_1.default.belongsTo(User_1.default, {
    foreignKey: 'teacherId',
    as: 'teacher',
});
AuthorizedStudent_1.default.belongsTo(User_1.default, {
    foreignKey: 'teacherId',
    as: 'teacher',
});
User_1.default.hasMany(AuthorizedStudent_1.default, {
    foreignKey: 'teacherId',
    as: 'authorizedStudents',
});
User_1.default.hasMany(UserConfig_1.default, {
    foreignKey: 'userId',
    as: 'configs',
    onDelete: 'CASCADE',
});
UserConfig_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'user',
});
const syncDatabase = async () => {
    try {
        await database_1.default.sync({ force: false });
        console.log('数据库表同步成功!');
    }
    catch (error) {
        console.error('数据库表同步失败:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
var database_2 = require("../config/database");
Object.defineProperty(exports, "testConnection", { enumerable: true, get: function () { return database_2.testConnection; } });
exports.default = database_1.default;
//# sourceMappingURL=index.js.map
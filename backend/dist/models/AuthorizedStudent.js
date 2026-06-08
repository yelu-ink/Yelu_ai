"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizedStudent = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class AuthorizedStudent extends sequelize_1.Model {
}
exports.AuthorizedStudent = AuthorizedStudent;
AuthorizedStudent.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    className: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: false,
    },
    isUsed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
    usedByUserId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    teacherId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
}, {
    sequelize: database_1.default,
    tableName: 'authorized_students',
    underscored: true,
});
exports.default = AuthorizedStudent;
//# sourceMappingURL=AuthorizedStudent.js.map
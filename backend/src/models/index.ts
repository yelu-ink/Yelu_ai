import sequelize, { testConnection } from '../config/database';
import User from './User';
import AuthorizedStudent from './AuthorizedStudent';
import Application from './Application';
import UserConfig from './UserConfig';
import RecruitmentResource from './RecruitmentResource';
import ApplicationWarning from './ApplicationWarning';

// 定义关联关系
User.hasMany(Application, {
  foreignKey: 'userId',
  as: 'applications',
  onDelete: 'CASCADE',
});

Application.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// 老师可以管理多个班级的学生
User.hasMany(AuthorizedStudent, {
  foreignKey: 'usedByUserId',
  as: 'managedStudents',
});

AuthorizedStudent.belongsTo(User, {
  foreignKey: 'usedByUserId',
  as: 'manager',
});

User.hasMany(User, {
  foreignKey: 'teacherId',
  as: 'students',
});

User.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

AuthorizedStudent.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

User.hasMany(AuthorizedStudent, {
  foreignKey: 'teacherId',
  as: 'authorizedStudents',
});

// 用户可以有多个配置
User.hasMany(UserConfig, {
  foreignKey: 'userId',
  as: 'configs',
  onDelete: 'CASCADE',
});

UserConfig.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(RecruitmentResource, {
  foreignKey: 'teacherId',
  as: 'recruitmentResources',
  onDelete: 'CASCADE',
});

RecruitmentResource.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

User.hasMany(ApplicationWarning, {
  foreignKey: 'studentId',
  as: 'receivedWarnings',
  onDelete: 'CASCADE',
});

User.hasMany(ApplicationWarning, {
  foreignKey: 'teacherId',
  as: 'sentWarnings',
  onDelete: 'CASCADE',
});

ApplicationWarning.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student',
});

ApplicationWarning.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

// 同步数据库
export const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('数据库表同步成功!');
  } catch (error) {
    console.error('数据库表同步失败:', error);
    throw error;
  }
};

export { User, AuthorizedStudent, Application, UserConfig, RecruitmentResource, ApplicationWarning };
export { testConnection } from '../config/database';
export default sequelize;

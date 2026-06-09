import sequelize from '../config/database';
import User from './User';
import AuthorizedStudent from './AuthorizedStudent';
import Application from './Application';
import UserConfig from './UserConfig';
import RecruitmentResource from './RecruitmentResource';
import ApplicationWarning from './ApplicationWarning';
export declare const syncDatabase: () => Promise<void>;
export { User, AuthorizedStudent, Application, UserConfig, RecruitmentResource, ApplicationWarning };
export { testConnection } from '../config/database';
export default sequelize;
//# sourceMappingURL=index.d.ts.map
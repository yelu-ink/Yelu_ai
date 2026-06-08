import { Model, Optional } from 'sequelize';
interface AuthorizedStudentAttributes {
    id: number;
    name: string;
    className: string;
    isUsed: boolean;
    usedByUserId?: number;
    teacherId?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface AuthorizedStudentCreationAttributes extends Optional<AuthorizedStudentAttributes, 'id' | 'isUsed' | 'teacherId' | 'createdAt' | 'updatedAt'> {
}
export declare class AuthorizedStudent extends Model<AuthorizedStudentAttributes, AuthorizedStudentCreationAttributes> implements AuthorizedStudentAttributes {
    id: number;
    name: string;
    className: string;
    isUsed: boolean;
    usedByUserId: number | undefined;
    teacherId: number | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default AuthorizedStudent;
//# sourceMappingURL=AuthorizedStudent.d.ts.map
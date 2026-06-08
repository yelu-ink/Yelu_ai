import { Model, Optional } from 'sequelize';
interface UserAttributes {
    id: number;
    username: string;
    password: string;
    plainPassword?: string;
    studentLink?: string;
    name: string;
    email?: string;
    phone?: string;
    className?: string;
    role: 'student' | 'teacher';
    teacherId?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'plainPassword' | 'studentLink' | 'teacherId' | 'createdAt' | 'updatedAt'> {
}
export declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    username: string;
    password: string;
    plainPassword: string | undefined;
    studentLink: string | undefined;
    name: string;
    email: string | undefined;
    phone: string | undefined;
    className: string | undefined;
    role: 'student' | 'teacher';
    teacherId: number | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default User;
//# sourceMappingURL=User.d.ts.map
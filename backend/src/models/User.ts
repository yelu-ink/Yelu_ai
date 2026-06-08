import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  plainPassword?: string;
  name: string;
  email?: string;
  phone?: string;
  className?: string;
  role: 'student' | 'teacher';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'plainPassword' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public plainPassword!: string | undefined;
  public name!: string;
  public email!: string | undefined;
  public phone!: string | undefined;
  public className!: string | undefined;
  public role!: 'student' | 'teacher';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    plainPassword: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    className: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher'),
      allowNull: false,
      defaultValue: 'student',
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
  }
);

export default User;

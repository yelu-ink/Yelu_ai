import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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

interface AuthorizedStudentCreationAttributes extends Optional<AuthorizedStudentAttributes, 'id' | 'isUsed' | 'teacherId' | 'createdAt' | 'updatedAt'> {}

export class AuthorizedStudent extends Model<AuthorizedStudentAttributes, AuthorizedStudentCreationAttributes> implements AuthorizedStudentAttributes {
  public id!: number;
  public name!: string;
  public className!: string;
  public isUsed!: boolean;
  public usedByUserId!: number | undefined;
  public teacherId!: number | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AuthorizedStudent.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    className: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    usedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'authorized_students',
    underscored: true,
  }
);

export default AuthorizedStudent;

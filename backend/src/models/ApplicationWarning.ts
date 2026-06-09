import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ApplicationWarningAttributes {
  id: number;
  studentId: number;
  teacherId: number;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApplicationWarningCreationAttributes
  extends Optional<ApplicationWarningAttributes, 'id' | 'isRead' | 'readAt' | 'createdAt' | 'updatedAt'> {}

export class ApplicationWarning
  extends Model<ApplicationWarningAttributes, ApplicationWarningCreationAttributes>
  implements ApplicationWarningAttributes
{
  public id!: number;
  public studentId!: number;
  public teacherId!: number;
  public isRead!: boolean;
  public readAt!: Date | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApplicationWarning.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'application_warnings',
    underscored: true,
  }
);

export default ApplicationWarning;

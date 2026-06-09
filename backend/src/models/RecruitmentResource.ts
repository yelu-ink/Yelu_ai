import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RecruitmentResourceAttributes {
  id: number;
  teacherId: number;
  title: string;
  category: string;
  description?: string;
  contentType: 'file' | 'link';
  filePath?: string;
  fileName?: string;
  linkUrl?: string;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RecruitmentResourceCreationAttributes
  extends Optional<
    RecruitmentResourceAttributes,
    'id' | 'description' | 'filePath' | 'fileName' | 'linkUrl' | 'priority' | 'createdAt' | 'updatedAt'
  > {}

export class RecruitmentResource
  extends Model<RecruitmentResourceAttributes, RecruitmentResourceCreationAttributes>
  implements RecruitmentResourceAttributes
{
  public id!: number;
  public teacherId!: number;
  public title!: string;
  public category!: string;
  public description!: string | undefined;
  public contentType!: 'file' | 'link';
  public filePath!: string | undefined;
  public fileName!: string | undefined;
  public linkUrl!: string | undefined;
  public priority!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecruitmentResource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contentType: {
      type: DataTypes.ENUM('file', 'link'),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    linkUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    tableName: 'recruitment_resources',
    underscored: true,
  }
);

export default RecruitmentResource;

import express from 'express';
import cors from 'cors';
import path from 'path';
import config from './config';
import { testConnection, syncDatabase } from './models';
import authRoutes from './routes/auth';
import applicationRoutes from './routes/applications';
import teacherRoutes from './routes/teacher';
import userConfigRoutes from './routes/user-configs';
import resourceRoutes from './routes/resources';
import bcrypt from 'bcryptjs';
import { User } from './models';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件目录（用于上传的文件）
app.use('/uploads', express.static(config.upload.dir));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/user-configs', userConfigRoutes);
app.use('/api/resources', resourceRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 生产环境：托管前端静态文件
if (config.nodeEnv === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));

  // 所有非 API 路由返回 index.html（支持 Vue Router history 模式）
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 开发环境 404 处理
  app.use((req: any, res: any) => {
    res.status(404).json({
      success: false,
      message: '接口不存在',
    });
  });
}

// 错误处理
app.use((err: any, req: any, res: any, next: any) => {
  console.error('错误:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
  });
});

// 初始化数据库和默认管理员账号
const initializeApp = async () => {
  try {
    await testConnection();
    await syncDatabase();

    // 创建默认管理员账号
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        role: 'teacher',
      });
      console.log('已创建默认管理员账号：admin / admin123');
    }

    // 启动服务器
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`\n========================================`);
      console.log(`  学生投递记录管理系统已启动`);
      console.log(`  环境：${config.nodeEnv}`);
      console.log(`  本机访问：http://localhost:${config.port}`);
      console.log(`  局域网访问：http://192.168.30.230:${config.port}`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
};

initializeApp();

export default app;

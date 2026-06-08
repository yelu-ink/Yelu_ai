import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import { User } from '../models';

const TEACHERS = [
  { username: 'teacher01', password: 'Teacher@01', name: '老师01' },
  { username: 'teacher02', password: 'Teacher@02', name: '老师02' },
  { username: 'teacher03', password: 'Teacher@03', name: '老师03' },
  { username: 'teacher04', password: 'Teacher@04', name: '老师04' },
  { username: 'teacher05', password: 'Teacher@05', name: '老师05' },
  { username: 'teacher06', password: 'Teacher@06', name: '老师06' },
];

async function main() {
  await sequelize.authenticate();

  console.log('\n========== 老师账号清单 ==========');

  for (const teacher of TEACHERS) {
    const existing = await User.findOne({ where: { username: teacher.username } });

    if (existing) {
      console.log(`已存在 | 账号: ${teacher.username} | 密码: ${teacher.password} | 姓名: ${existing.name}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(teacher.password, 10);
    await User.create({
      username: teacher.username,
      password: hashedPassword,
      name: teacher.name,
      role: 'teacher',
    });

    console.log(`已创建 | 账号: ${teacher.username} | 密码: ${teacher.password} | 姓名: ${teacher.name}`);
  }

  console.log('==================================\n');

  await sequelize.close();
}

main().catch((error) => {
  console.error('创建老师账号失败:', error);
  process.exit(1);
});

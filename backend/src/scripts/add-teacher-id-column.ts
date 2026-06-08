import sequelize from '../config/database';
import { User } from '../models';

async function main() {
  await sequelize.authenticate();

  const [userColumns] = await sequelize.query(`PRAGMA table_info(users);`) as [Array<{ name: string }>, unknown];
  if (!userColumns.some((column) => column.name === 'teacher_id')) {
    await sequelize.query(`ALTER TABLE users ADD COLUMN teacher_id INTEGER;`);
    console.log('✓ 已添加 users.teacher_id 列');
  } else {
    console.log('✓ users.teacher_id 列已存在，跳过加列');
  }

  const [authColumns] = await sequelize.query(`PRAGMA table_info(authorized_students);`) as [Array<{ name: string }>, unknown];
  if (!authColumns.some((column) => column.name === 'teacher_id')) {
    await sequelize.query(`ALTER TABLE authorized_students ADD COLUMN teacher_id INTEGER;`);
    console.log('✓ 已添加 authorized_students.teacher_id 列');
  } else {
    console.log('✓ authorized_students.teacher_id 列已存在，跳过加列');
  }

  const defaultTeacher = await User.findOne({
    where: { username: 'admin', role: 'teacher' },
  }) || await User.findOne({
    where: { role: 'teacher' },
    order: [['id', 'ASC']],
  });

  if (!defaultTeacher) {
    throw new Error('未找到可用的老师账号，无法回填 teacher_id');
  }

  const [, studentMeta] = await sequelize.query(
    `UPDATE users SET teacher_id = :teacherId WHERE role = 'student' AND teacher_id IS NULL;`,
    { replacements: { teacherId: defaultTeacher.id } }
  );
  console.log(`✓ 已回填学生账号归属老师 ${defaultTeacher.username}`);

  await sequelize.query(
    `UPDATE authorized_students SET teacher_id = :teacherId WHERE teacher_id IS NULL;`,
    { replacements: { teacherId: defaultTeacher.id } }
  );
  console.log(`✓ 已回填 authorized_students 归属老师 ${defaultTeacher.username}`);

  await sequelize.close();
}

main().catch((error) => {
  console.error('迁移失败:', error);
  process.exit(1);
});

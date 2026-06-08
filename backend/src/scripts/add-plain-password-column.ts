import sequelize from '../config/database';
import { User } from '../models';

const TEST_USERNAMES = ['student1', 'student2', 'student3', 'student4', 'student5'];

async function main() {
  await sequelize.authenticate();

  const [columns] = await sequelize.query(`PRAGMA table_info(users);`) as [Array<{ name: string }>, unknown];
  const hasColumn = columns.some((column) => column.name === 'plain_password');

  if (!hasColumn) {
    await sequelize.query(`ALTER TABLE users ADD COLUMN plain_password VARCHAR(50);`);
    console.log('✓ 已添加 plain_password 列');
  } else {
    console.log('✓ plain_password 列已存在，跳过加列');
  }

  const [updatedCount] = await User.update(
    { plainPassword: '123456' },
    { where: { username: TEST_USERNAMES } }
  );
  console.log(`✓ 已回填 ${updatedCount} 个测试账号密码为 123456`);

  await sequelize.close();
}

main().catch((error) => {
  console.error('迁移失败:', error);
  process.exit(1);
});

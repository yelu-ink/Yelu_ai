import sequelize from '../config/database';

async function main() {
  await sequelize.authenticate();

  const [columns] = await sequelize.query(`PRAGMA table_info(users);`) as [Array<{ name: string }>, unknown];
  const hasColumn = columns.some((column) => column.name === 'student_link');

  if (!hasColumn) {
    await sequelize.query(`ALTER TABLE users ADD COLUMN student_link VARCHAR(500);`);
    console.log('✓ 已添加 student_link 列');
  } else {
    console.log('✓ student_link 列已存在，跳过加列');
  }

  await sequelize.close();
}

main().catch((error) => {
  console.error('迁移失败:', error);
  process.exit(1);
});

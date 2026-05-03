#!/usr/bin/env node

const mysql = require('mysql2/promise');

async function getCourseId(courseName) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'alpaca_db'
    });

    const [rows] = await connection.execute(
      'SELECT id, name FROM courses WHERE name LIKE ? LIMIT 1',
      [`%${courseName}%`]
    );

    if (rows.length > 0) {
      console.log('\n✅ Found:');
      console.log('Course ID:', rows[0].id);
      console.log('Course Name:', rows[0].name);
      console.log('\n');
    } else {
      console.log('\n❌ Course not found. Available courses:\n');
      const [allCourses] = await connection.execute('SELECT id, name FROM courses');
      allCourses.forEach(c => console.log(`  [${c.id}] ${c.name}`));
      console.log('\n');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

const courseName = process.argv[2] || 'Conflict Resolution';
getCourseId(courseName);

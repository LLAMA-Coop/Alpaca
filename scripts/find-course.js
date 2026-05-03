#!/usr/bin/env node

const http = require('http');

function getCourseFromAPI(courseName) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/course/public',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        
        // Try different response structures
        const courses = json.data || json || [];
        const courseArray = Array.isArray(courses) ? courses : [];
        
        const course = courseArray.find(c => c.name && c.name.includes(courseName));
        
        if (course) {
          console.log('\n✅ Found:');
          console.log('Course ID:', course.id);
          console.log('Course Name:', course.name);
          console.log('\n');
        } else {
          console.log('\n❌ Course not found. Available courses:\n');
          if (courseArray.length > 0) {
            courseArray.forEach(c => console.log(`  [${c.id}] ${c.name}`));
          } else {
            console.log('  (No courses found in response)');
          }
          console.log('\n');
        }
      } catch (e) {
        console.error('Error parsing response:', e.message);
        console.error('Raw response:', data.substring(0, 500));
      }
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
  });
  req.end();
}

const courseName = process.argv[2] || 'Conflict Resolution';
getCourseFromAPI(courseName);

const fs = require('fs');

const files = ['index.html', 'keluarga-mulia.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=MaleIcon/g, 'assets/male.svg');
  content = content.replace(/https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=FemaleIcon/g, 'assets/female.svg');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

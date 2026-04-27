const fs = require("fs");

const femaleNames = [
  "Mulia", "Hikmah", "Farida", "Maryani", "Har", "Ade", "Erni", 
  "Pasangan Ke-7", "Pasangan Ke-8", "Siti Zubaidah", "Nani", 
  "Ade Irma Soraya", "Ida Novianti", "Maryana Agustina", "Novitri Hasanah", 
  "Husnah", "Ika", "Nurlaila", "Rosada", "Maryama", "Nur Asiah", 
  "Siti Atiyah", "Siti Napisah", "Susanti", "Nuronia", "Dewi Maryam", 
  "Yessi", "Fina", "Ratna", "Naseha", "Rodiah", "Fulan"
];

const maleNames = [
  "Abdurahman bin Muhammad Nazi", "Iskandar", "Ruswanto", "Mulyadi", 
  "Rusli", "Keturunan Ke-7 Mulia", "Keturunan Ke-8 Mulia", "Yusuf Lubis", 
  "Yusman Helmi", "Agus Pribadi", "Ilham", "Achmad Dimyati", "Ahmad Ramli", 
  "Muhsin", "Widiyono", "Yusuf", "Usep", "Agung", "Jimmy Wachman", 
  "Achmad Fauzi", "Alfian", "Sofyan", "Maryo", "Amri", "Taufik", 
  "Asli Rusli", "Muhammad Aby Rahman", "Muhammad Lutfi Maulidi", 
  "Muhammad Lukamn Rafi", "Junaedi", "Mulud", "Ramli"
];

let file = fs.readFileSync("index.html", "utf8");

file = file.replace(/(husband|wife):\s*\{\s*name:\s*"([^"]+)",\s*avatar:\s*"([^"]+)"/g, (match, key, name, avatar) => {
  let isFemale = femaleNames.includes(name) || name.toLowerCase().includes("siti") || name.toLowerCase().includes("binti");
  let isMale = maleNames.includes(name) || name.toLowerCase().includes("bin ") || name.toLowerCase().includes("muhammad");
  
  // Default fallback if not found
  if (!isFemale && !isMale) {
     console.log("Unmapped: " + name);
     isMale = true; // default
  }
  
  let newAvatar = isFemale ? "assets/female.svg" : "assets/male.svg";
  
  return `${key}: { name: "${name}", avatar: "${newAvatar}"`;
});

fs.writeFileSync("index.html", file);
console.log("index.html updated successfully!");

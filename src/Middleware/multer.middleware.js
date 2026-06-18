import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'src', 'public')
console.log(`Upload directory path: ${uploadDir}`);

// ensuring folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log(`Created upload directory at ${uploadDir}`);
}else{
    console.log(`Upload directory exists at ${uploadDir}`);
}


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, uploadDir);
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({storage})
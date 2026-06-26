import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/devices', // Папка сохранения
    filename: (req, file, cb) => {
      // Уникальное имя: uuid + оригинальное расширение
      const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Разрешаем только изображения
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Максимум 5 МБ
  },
};
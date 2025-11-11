import { Router } from 'express';
import multer from 'multer';
import { isAuthenticated } from '../middlewares/auth';
import * as attachmentController from '../controllers/attachmentController';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

router.use(isAuthenticated);

router.get('/:cardId', attachmentController.getAttachments);
router.post('/', upload.single('file'), attachmentController.uploadAttachment);
router.delete('/:id', attachmentController.deleteAttachment);

export default router;

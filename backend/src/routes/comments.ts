import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import * as commentController from '../controllers/commentController';

const router = Router();

router.use(isAuthenticated);

router.get('/:cardId', commentController.getComments);
router.post('/', commentController.createComment);
router.delete('/:id', commentController.deleteComment);

export default router;

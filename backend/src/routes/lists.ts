import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import * as listController from '../controllers/listController';

const router = Router();

router.use(isAuthenticated);

router.get('/:boardId', listController.getLists);
router.post('/', listController.createList);
router.put('/:id', listController.updateList);
router.delete('/:id', listController.deleteList);

export default router;

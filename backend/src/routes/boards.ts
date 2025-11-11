import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import * as boardController from '../controllers/boardController';

const router = Router();

router.use(isAuthenticated);

router.get('/', boardController.getBoards);
router.post('/', boardController.createBoard);
router.get('/:id', boardController.getBoard);
router.put('/:id', boardController.updateBoard);
router.delete('/:id', boardController.deleteBoard);
router.post('/:id/members', boardController.addMember);
router.delete('/:id/members/:userId', boardController.removeMember);

export default router;

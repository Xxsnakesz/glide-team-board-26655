import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth';
import * as cardController from '../controllers/cardController';

const router = Router();

router.use(isAuthenticated);

router.get('/:listId', cardController.getCards);
router.post('/', cardController.createCard);
router.put('/:id', cardController.updateCard);
router.put('/:id/move', cardController.moveCard);
router.delete('/:id', cardController.deleteCard);

export default router;

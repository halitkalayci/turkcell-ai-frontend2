import { Router } from 'express';
import { getAll, getById, create, update, partialUpdate, remove } from '../controllers/productController';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.patch('/:id', partialUpdate);
router.delete('/:id', remove);

export default router;

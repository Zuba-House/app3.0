import { Router } from 'express';
import { getSearch, imageSearch } from '../controllers/search.controller.js';

const searchRouter = Router();

searchRouter.get('/', getSearch);
searchRouter.post('/image', imageSearch);

export default searchRouter;

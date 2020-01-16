import Router from 'express';

import DevsController from './app/controller/DevsController';
import SearchController from './app/controller/SearchController';

const routes = new Router();

routes.get('/devs', DevsController.index);
routes.post('/devs', DevsController.store);

routes.get('/search', SearchController.index);

export default routes;

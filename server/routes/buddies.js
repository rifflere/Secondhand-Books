const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const ctrl = require('../controllers/buddiesController');

router.get('/search', authenticate, ctrl.search);
router.get('/feed', authenticate, ctrl.feed);
router.get('/requests/incoming', authenticate, ctrl.incoming);
router.get('/requests/outgoing', authenticate, ctrl.outgoing);
router.get('/', authenticate, ctrl.list);
router.post('/request', authenticate, ctrl.sendRequest);
router.patch('/:id', authenticate, ctrl.respond);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;

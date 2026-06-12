const buddiesService = require('../services/buddiesService');

const search = async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q || !q.trim()) return res.status(400).json({ error: 'Search query required' });
    res.json(await buddiesService.searchUsers(q, req.user.id));
  } catch (err) { next(err); }
};

const sendRequest = async (req, res, next) => {
  try {
    if (!req.body.username) return res.status(400).json({ error: 'Username is required' });
    const result = await buddiesService.sendRequest(req.user.id, req.body.username);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const respond = async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'action must be accept or decline' });
    }
    await buddiesService.respondToRequest(parseInt(req.params.id, 10), req.user.id, action);
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    res.json(await buddiesService.listBuddies(req.user.id));
  } catch (err) { next(err); }
};

const incoming = async (req, res, next) => {
  try {
    res.json(await buddiesService.listIncoming(req.user.id));
  } catch (err) { next(err); }
};

const outgoing = async (req, res, next) => {
  try {
    res.json(await buddiesService.listOutgoing(req.user.id));
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await buddiesService.removeBuddy(parseInt(req.params.id, 10), req.user.id);
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const feed = async (req, res, next) => {
  try {
    res.json(await buddiesService.getFeed(req.user.id));
  } catch (err) { next(err); }
};

module.exports = { search, sendRequest, respond, list, incoming, outgoing, remove, feed };

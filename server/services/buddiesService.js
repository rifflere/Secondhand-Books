const buddiesRepo = require('../repositories/buddiesRepository');
const usersRepo = require('../repositories/usersRepository');

const searchUsers = async (query, currentUserId) => {
  if (!query || !query.trim()) return [];
  const rows = await usersRepo.searchByUsername(query.trim(), currentUserId);
  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    friendshipId: r.friendship_id || null,
    status: r.friendship_status || null,
    direction: r.direction || null,
  }));
};

const sendRequest = async (fromUserId, toUsername) => {
  const toUser = await usersRepo.findPublicByUsername(toUsername);
  if (!toUser) throw Object.assign(new Error('User not found'), { status: 404 });
  if (toUser.id === fromUserId) {
    throw Object.assign(new Error('Cannot send a request to yourself'), { status: 400 });
  }

  // Already buddies or request sent
  const existing = await buddiesRepo.findRequest(fromUserId, toUser.id);
  if (existing) throw Object.assign(new Error('Request already sent'), { status: 409 });

  // They already sent us a request — auto-accept
  const reverse = await buddiesRepo.findRequest(toUser.id, fromUserId);
  if (reverse) {
    if (reverse.status === 'accepted') {
      throw Object.assign(new Error('Already book buddies'), { status: 409 });
    }
    if (reverse.status === 'pending') {
      await buddiesRepo.updateRequest(reverse.id, 'accepted');
      return { autoAccepted: true, toUsername };
    }
  }

  const id = await buddiesRepo.createRequest(fromUserId, toUser.id);
  return { id, toUsername };
};

const respondToRequest = async (requestId, userId, action) => {
  const req = await buddiesRepo.findById(requestId);
  if (!req) throw Object.assign(new Error('Request not found'), { status: 404 });
  if (req.receiver_id !== userId) throw Object.assign(new Error('Access denied'), { status: 403 });
  if (req.status !== 'pending') {
    throw Object.assign(new Error('Request already handled'), { status: 409 });
  }
  await buddiesRepo.updateRequest(requestId, action === 'accept' ? 'accepted' : 'declined');
};

const listBuddies = async (userId) => {
  return buddiesRepo.findAccepted(userId);
};

const listIncoming = async (userId) => {
  return buddiesRepo.findIncoming(userId);
};

const listOutgoing = async (userId) => {
  return buddiesRepo.findOutgoing(userId);
};

const removeBuddy = async (friendshipId, userId) => {
  const removed = await buddiesRepo.remove(friendshipId, userId);
  if (!removed) throw Object.assign(new Error('Friendship not found'), { status: 404 });
};

const getFeed = async (userId) => {
  const rows = await buddiesRepo.findFeed(userId, 20);
  return rows.map((r) => ({
    bookId: r.id,
    title: r.title,
    author: r.author,
    cover: r.cover_url,
    shelfId: r.shelf_id,
    shelfName: r.shelf_name,
    userId: r.user_id,
    username: r.username,
    activityAt: r.activity_at,
  }));
};

module.exports = {
  searchUsers, sendRequest, respondToRequest,
  listBuddies, listIncoming, listOutgoing,
  removeBuddy, getFeed,
};

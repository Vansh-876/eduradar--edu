async function createNotification({ recipientId, actorId = null, type = 'general', message, link = '' }) {
  const notif = new Notification({
    user: recipientId,  // <-- here change userId to user
    actor: actorId,
    type,
    message,
    link
  });
  await notif.save();

  try {
    const io = socketUtil.getIO();
    io.to(recipientId.toString()).emit('newNotification', {
      _id: notif._id,
      user: notif.user,
      actor: notif.actor,
      type: notif.type,
      message: notif.message,
      link: notif.link,
      read: notif.read,
      createdAt: notif.createdAt
    });
  } catch (err) {
    console.error('Socket emit skipped:', err.message);
  }

  return notif;
}





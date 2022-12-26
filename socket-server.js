const io = require('socket.io');

const createsocket = async (server) => {
  try {
    socketInstance = io(server);
    socketInstance.on('connection', (socket) => {
      console.log('socket user connnected');
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
      socket.on('onTotalRunChangeNotification', (msgValues) => {
        console.log('onRunChange');
        socketInstance.emit('onTotalRunChange', msgValues);
      });
      socket.on('onFeedChangeNotification', (msgValues) => {
        console.log('onFeedChangeNotification');
        socketInstance.emit('onFeedChange', msgValues);
      });
      socket.on('onFeedCreatedNotification', (msgValues) => {
        socketInstance.emit('onFeedCreated', msgValues);
      });
      socket.on('onNewCommentCreatedNotification', (msgValues) => {
        socketInstance.emit('onNewCommentCreated', msgValues);
      });
      socket.on('onNewNotificationOnNotification', (data) => {
        socketInstance.emit('onNewNotification', data);
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('socket user disconnect');
    });
  } catch (err) {
    console.log(
      ' Server is down at this point of time!!!Sorry for inconvenience'
    );

    Promise.reject(err);
  }
};

module.exports = createsocket;

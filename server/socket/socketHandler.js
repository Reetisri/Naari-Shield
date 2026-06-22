module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join user's individual room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined user room: ${userId}`);
      }
    });

    // Guardian joining multiple rooms for linked users
    socket.on('join_guardian', (userIds) => {
      if (Array.isArray(userIds)) {
        userIds.forEach(userId => {
          socket.join(userId);
          console.log(`Guardian Socket ${socket.id} joined user room: ${userId}`);
        });
      }
    });

    // Listen and broadcast emergency events
    socket.on('sosTriggered', (data) => {
      // data: { userId, userName, latitude, longitude, batteryLevel, riskScore }
      console.log(`SOS Triggered by User ${data.userId}:`, data);
      socket.to(data.userId).emit('sosTriggered', data);
    });

    socket.on('locationUpdated', (data) => {
      // data: { userId, latitude, longitude, timestamp }
      console.log(`Location updated for User ${data.userId}:`, data);
      socket.to(data.userId).emit('locationUpdated', data);
    });

    socket.on('batteryUpdated', (data) => {
      // data: { userId, batteryLevel, isCharging }
      console.log(`Battery telemetry for User ${data.userId}:`, data);
      socket.to(data.userId).emit('batteryUpdated', data);
    });

    socket.on('riskUpdated', (data) => {
      // data: { userId, riskScore, level, reasons }
      console.log(`Risk matrix updated for User ${data.userId}:`, data);
      socket.to(data.userId).emit('riskUpdated', data);
    });

    socket.on('audioUploaded', (data) => {
      // data: { userId, audioUrl }
      console.log(`Audio clip ready for User ${data.userId}:`, data);
      socket.to(data.userId).emit('audioUploaded', data);
    });

    socket.on('sosResolved', (data) => {
      // data: { userId, userName }
      console.log(`SOS resolved by User ${data.userId}:`, data);
      socket.to(data.userId).emit('sosResolved', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });
};

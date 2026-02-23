// const io = require('socket.io-client');
// const http = require('http');

// // Get cookie from login
// async function getCookie(username, password) {
//   return new Promise((resolve, reject) => {
//     const data = JSON.stringify({ username, password });
//     const options = {
//       hostname: 'localhost',
//       port: 3000,
//       path: '/auth/login',
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Content-Length': data.length
//       }
//     };

//     const req = http.request(options, (res) => {
//       let body = '';
//       res.on('data', chunk => body += chunk);
//       res.on('end', () => {
//         console.log('Response status:', res.statusCode);
        
//         const setCookie = res.headers['set-cookie'];
//         if (!setCookie) {
//           reject('No Set-Cookie header in response');
//           return;
//         }
//         // Extract just the cookie part (before semicolon)
//         const cookie = setCookie[0].split(';')[0];
//         resolve(cookie);
//       });
//     });

//     req.on('error', reject);
//     req.write(data);
//     req.end();
//   });
// }

// // Test user
// async function testUser(userName, username, password) {
//   try {
//     console.log(`🔐 Getting cookie for ${userName}...`);
//     const cookie = await getCookie(username, password);
//     console.log(`✔️ Cookie received for ${userName}`);

//     const socket = io('http://localhost:3005/game', {
//       extraHeaders: {
//         'Cookie': cookie
//       },
//       reconnection: true
//     });

//     socket.on('connect', () => {
//       console.log(`✅ ${userName} connected to WebSocket`);
//       socket.emit('mm.join');
//     });

//     socket.on('mm.response', (data) => {
//       console.log(`📋 ${userName} response:`, data);
//     });

//     socket.on('mm.matched', (data) => {
//       console.log(`🏁 ${userName} MATCHED! Session: ${data.sessionId}`);
//       setTimeout(() => socket.disconnect(), 2000);
//     });

//     socket.on('error', (error) => {
//       console.error(`⚠️ ${userName} error:`, error);
//     });

//     socket.on('disconnect', () => {
//       console.log(`❌ ${userName} disconnected`);
//     });
//   } catch (error) {
//     console.error(`❌ ${userName} failed:`, error);
//   }
// }

// // Replace with your actual test users
// console.log('🚀 Starting WebSocket test...\n');
// testUser('User 1', 'bimo', '123456');
// setTimeout(() => testUser('User 2', 'vimo', '123456'), 3000);
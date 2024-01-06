const axios = require('axios');
const bodyParser = require('body-parser');
const http = require('http');
const fs = require('fs'); 

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/email-bounce') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      console.log('Received SNS notification:', body);

      const payload = JSON.parse(body);
      const message = JSON.parse(payload.Message); 
      const messageType = payload.Type;

      if (!message) {
        console.error('Invalid SNS message:', payload);
        res.writeHead(400);
        res.end('Invalid SNS message');
        return;
      }

      const notificationType = message.notificationType;
      const destination = message.mail.destination;

      console.log('Notification Type:', notificationType);
      console.log('Destination:', destination);

      if (notificationType.includes('Bounce') || notificationType.includes('Complaint')) {
        fs.appendFile('list.txt', destination + '\n', (err) => {
          if (err) throw err;
          console.log('Destination added to list.txt');
        });
      }

      res.writeHead(200);
      res.end('OK');
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
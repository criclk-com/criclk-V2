// server.js - Main Node.js server file with protected stream URLs
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Channel configuration - Store actual URLs securely server-side
const channels = {
  'skySportsCricket': {
    name: 'Sky Sports Cricket HD',
    key: 'sky-sports-cricket'
  },
  'starSports': {
    name: 'Star Sports HD',
    key: 'star-sports'
  },
  'willowCricket': {
    name: 'Willow Cricket HD',
    key: 'willow-cricket'
  },
  'willowcrickethd': {
    name: 'Willow Cricket HD',
    key: 'willow-cricket-hd'
  },
  'ptvSports': {
    name: 'PTV Sports',
    key: 'ptv-sports'
  },
  'asporthd': {
    name: 'A Sports HD',
    key: 'a-sport-hd'
  }
};

// Secure mapping of channel keys to actual stream URLs (hidden from client)
const streamUrls = {
  'sky-sports-cricket': '//stream.crichd.sc/update/skys2.php',
  'star-sports': '//stream.crichd.sc/update/star.php',
  'willow-cricket': '//stream.crichd.sc/update/willowcricket.php',
  'willow-cricket-hd': '//stream.crichd.sc/update/willowcricket.php',
  'ptv-sports': '//stream.crichd.sc/update/ptv.php',
  'a-sport-hd': '//stream.crichd.sc/update/asportshd.php'
};

// Generate encrypted keys for channels
function encryptChannel(channelId) {
  // In production, use environment variables for secrets
  const secret = process.env.ENCRYPTION_SECRET || 'temporary-dev-secret-key';
  return crypto
    .createHmac('sha256', secret)
    .update(channelId)
    .digest('hex');
}

// Home route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Cricket Streaming - Home',
    page: 'home'
  });
});

// IPL20 route
app.get('/ipl20', (req, res) => {
  // Generate encrypted tokens for each channel
  const encryptedChannels = {};
  Object.keys(channels).forEach(id => {
    if (['skySportsCricket', 'starSports', 'willowCricket'].includes(id)) {
      encryptedChannels[id] = {
        name: channels[id].name,
        token: encryptChannel(id)
      };
    }
  });
  
  res.render('ipl20', {
    title: 'IPL20 Streaming',
    page: 'ipl20',
    channels: encryptedChannels,
    defaultChannel: 'starSports'
  });
});

// PSLT20 route
app.get('/pslt20', (req, res) => {
  // Generate encrypted tokens for PSL channels
  const encryptedChannels = {};
  Object.keys(channels).forEach(id => {
    if (['asporthd', 'ptvSports', 'willowcrickethd'].includes(id)) {
      encryptedChannels[id] = {
        name: channels[id].name,
        token: encryptChannel(id)
      };
    }
  });
  
  res.render('pslt20', {
    title: 'PSLT20 Streaming',
    page: 'pslt20',
    channels: encryptedChannels,
    defaultChannel: 'ptvSports'
  });
});

// Live Cricket route
app.get('/live-cricket', (req, res) => {
  res.render('live-cricket', {
    title: 'Live Cricket',
    page: 'live-cricket'
  });
});

// All Channels route
app.get('/all-channels', (req, res) => {
  res.render('all-channels', {
    title: 'All Channels',
    page: 'all-channels',
    channels: channels
  });
});

// Proxy endpoint for secure stream delivery - This hides actual URLs from page source
app.get('/stream/:token', (req, res) => {
  const requestedToken = req.params.token;
  let channelId = null;
  
  // Find the channel that matches the encrypted token
  Object.keys(channels).forEach(id => {
    if (encryptChannel(id) === requestedToken) {
      channelId = id;
    }
  });
  
  if (!channelId) {
    return res.status(404).send('Stream not found');
  }
  
  // Get the actual stream URL from our secure mapping
  const streamUrl = streamUrls[channels[channelId].key];
  
  if (!streamUrl) {
    return res.status(404).send('Stream URL not configured');
  }
  
  // Set appropriate headers for iframe embedding
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Render an HTML page with the iframe that loads the stream
  // This way the actual stream URL is never exposed in the source
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${channels[channelId].name} Stream</title>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: 0; }
      </style>
    </head>
    <body>
      <iframe 
        src="${streamUrl}" 
        width="100%" 
        height="100%" 
        marginheight="0" 
        marginwidth="0" 
        scrolling="no" 
        frameborder="0" 
        allowfullscreen 
        allow="encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation">
      </iframe>
    </body>
    </html>
  `);
});

// Channel page with encrypted URL
app.get('/ipl20-:token', (req, res) => {
  const requestedToken = req.params.token;
  let channelId = null;
  
  // Find the channel that matches the encrypted token
  Object.keys(channels).forEach(id => {
    if (encryptChannel(id) === requestedToken) {
      channelId = id;
    }
  });
  
  if (!channelId) {
    return res.status(404).send('Channel not found');
  }
  
  res.render('channel', {
    title: channels[channelId].name,
    page: 'channel',
    channel: channels[channelId],
    channelId: channelId,
    streamToken: requestedToken
  });
});

// PSLT20 channel page
app.get('/pslt20-:token', (req, res) => {
  const requestedToken = req.params.token;
  let channelId = null;
  
  // Find the channel that matches the encrypted token
  Object.keys(channels).forEach(id => {
    if (encryptChannel(id) === requestedToken) {
      channelId = id;
    }
  });
  
  if (!channelId) {
    return res.status(404).send('Channel not found');
  }
  
  res.render('channel', {
    title: channels[channelId].name,
    page: 'channel',
    channel: channels[channelId],
    channelId: channelId,
    streamToken: requestedToken
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

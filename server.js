// server.js - Updated with mobile device detection
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper function to detect mobile devices from user agent
function isMobileDevice(req) {
  const userAgent = req.headers['user-agent'] || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// Secure secret key (change this in production)
const SECRET_KEY = 'your-secure-key-change-in-production';

// Channel configuration
const channels = {
  'skySportsCricket': {
    name: 'Sky Sports Cricket HD',
    streamSource: '//stream.crichd.sc/update/skys2.php'
  },
  'starSports': {
    name: 'Star Sports HD',
    streamSource: '//stream.crichd.sc/update/star.php'
  },
  'willowCricket': {
    name: 'Willow Cricket HD',
    streamSource: '//stream.crichd.sc/update/willowcricket.php'
  },
  'geoSuper': {
    name: 'Geo Super',
    streamSource: '//stream.crichd.sc/update/geosuper.php'
  },
  'ptvSports': {
    name: 'PTV Sports',
    streamSource: '//stream.crichd.sc/update/ptvsports.php'
  },
  'tenSports': {
    name: 'Ten Sports',
    streamSource: '//stream.crichd.sc/update/tensports.php'
  }
};

// IPL match schedule data - Normally you would load this from a database or external file
// For simplicity, we'll include a few sample matches
const iplSchedule = [
  {
    "matchNumber": "Match 49",
    "team1": "Chennai Super Kings",
    "team2": "Punjab Kings",
    "team1Logo": "https://s3.ap-southeast-1.amazonaws.com/dlg.dialog.lk/s3fs-public/2024-03/csk-logo.jpg",
    "team2Logo": "https://s3.ap-southeast-1.amazonaws.com/dlg.dialog.lk/s3fs-public/2024-03/pk-logo.jpg",
    "date": "30th Apr",
    "time": "07.30 PM",
    "channels": "Star Sports 1 | Star Sports 1 HD"
  },
  {
    "matchNumber": "Match 50",
    "team1": "Rajasthan Royals",
    "team2": "Mumbai Indians",
    "team1Logo": "https://s3.ap-southeast-1.amazonaws.com/dlg.dialog.lk/s3fs-public/2024-03/rr-logo.jpg",
    "team2Logo": "https://s3.ap-southeast-1.amazonaws.com/dlg.dialog.lk/s3fs-public/2024-03/mi-logo.jpg",
    "date": "1st May",
    "time": "07:30 PM",
    "channels": "Star Sports 1 | Star Sports 1 HD"
  },
  {
    "matchNumber": "Match 51",
    "team1": "Gujarat Titans",
    "team2": "Sunrisers Hyderabad",
    "team1Logo": "https://s3.ap-southeast-1.amazonaws.com/dlg.dialog.lk/s3fs-public/2024-03/gt-logo.jpg",
    "team2Logo": "https://s3.ap-southeast-1.amazonaws.com/dlg.dialog.lk/s3fs-public/2024-03/sh-logo.jpg",
    "date": "2nd May",
    "time": "07:30 PM",
    "channels": "Star Sports 1 | Star Sports 1 HD"
  }
];

// Function to filter matches for today and future dates
function getUpcomingMatches() {
  // Get current date in IST (India Standard Time)
  const now = new Date();
  const offsetIST = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const nowIST = new Date(now.getTime() + (offsetIST + now.getTimezoneOffset() * 60 * 1000));
  
  // Function to parse date string like "30th Apr"
  function parseDate(dateStr) {
    const dateParts = dateStr.match(/(\d+)(st|nd|rd|th) (\w+)/);
    if (!dateParts) return null;
    
    const day = parseInt(dateParts[1]);
    const month = dateParts[3];
    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Current year (assuming all matches are in current year)
    const year = nowIST.getFullYear();
    return new Date(year, monthMap[month], day);
  }
  
  // Function to check if two dates are the same day
  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear();
  }
  
  // Filter matches to show only current and future matches
  return iplSchedule.filter(match => {
    const matchDate = parseDate(match.date);
    return matchDate && (matchDate >= nowIST || isSameDay(matchDate, nowIST));
  });
}

// Function to mark today's matches
function markTodayMatches(matches) {
  // Get current date in IST (India Standard Time)
  const now = new Date();
  const offsetIST = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const nowIST = new Date(now.getTime() + (offsetIST + now.getTimezoneOffset() * 60 * 1000));
  
  // Function to parse date string like "30th Apr"
  function parseDate(dateStr) {
    const dateParts = dateStr.match(/(\d+)(st|nd|rd|th) (\w+)/);
    if (!dateParts) return null;
    
    const day = parseInt(dateParts[1]);
    const month = dateParts[3];
    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Current year (assuming all matches are in current year)
    const year = nowIST.getFullYear();
    return new Date(year, monthMap[month], day);
  }
  
  // Function to check if two dates are the same day
  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getFullYear() === date2.getFullYear();
  }
  
  // Mark today's matches
  return matches.map(match => {
    const matchDate = parseDate(match.date);
    const isToday = matchDate && isSameDay(matchDate, nowIST);
    return {
      ...match,
      isToday
    };
  });
}

// Generate encrypted token for a channel
function generateChannelToken(channelId) {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(channelId)
    .digest('hex');
}

// Generate a time-limited one-time token
function generateTimeToken(channelId) {
  // Token valid for 15 minutes
  const expiresAt = Date.now() + 15 * 60 * 1000;
  
  // Create a unique string with timestamp
  const dataToEncrypt = `${channelId}|${expiresAt}`;
  
  // Encrypt the data
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY.padEnd(32)), Buffer.alloc(16, 0));
  let encrypted = cipher.update(dataToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return token with expiration
  return `${encrypted}.${expiresAt}`;
}

// Verify and decode a time token
function verifyTimeToken(token) {
  try {
    // Extract the expiration time
    const parts = token.split('.');
    const encryptedData = parts[0];
    const expiresAt = parseInt(parts[1]);
    
    // Check if token has expired
    if (expiresAt < Date.now()) {
      return null;
    }
    
    // Decrypt the data
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY.padEnd(32)), Buffer.alloc(16, 0));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Extract the channel ID
    const channelId = decrypted.split('|')[0];
    
    return channelId;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Verify if the request is coming from our site
function isValidReferrer(req) {
  const referrer = req.headers.referer || '';
  const host = req.headers.host;
  return referrer.includes(host);
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
  // Get upcoming matches
  const upcomingMatches = markTodayMatches(getUpcomingMatches());
  
  // Generate channel data for the page
  const pageChannels = {};
  ['skySportsCricket', 'starSports', 'willowCricket'].forEach(id => {
    pageChannels[id] = {
      name: channels[id].name,
      token: generateChannelToken(id)
    };
  });
  
  res.render('ipl20', {
    title: 'IPL20 Streaming',
    page: 'ipl20',
    channels: pageChannels,
    defaultChannel: 'starSports',
    matches: upcomingMatches,
    isMobile: isMobileDevice(req)
  });
});

// PSLT20 route
app.get('/pslt20', (req, res) => {
  // Generate channel data for the page
  const pageChannels = {};
  ['geoSuper', 'ptvSports', 'tenSports'].forEach(id => {
    pageChannels[id] = {
      name: channels[id].name,
      token: generateChannelToken(id)
    };
  });
  
  res.render('pslt20', {
    title: 'PSLT20 Streaming',
    page: 'pslt20',
    channels: pageChannels,
    defaultChannel: 'ptvSports',
    isMobile: isMobileDevice(req)
  });
});

// Live Cricket route
app.get('/live-cricket', (req, res) => {
  // Get upcoming matches for live cricket section
  const upcomingMatches = markTodayMatches(getUpcomingMatches());
  
  // Generate channel data for the page
  const pageChannels = {};
  Object.keys(channels).forEach(id => {
    pageChannels[id] = {
      name: channels[id].name,
      token: generateChannelToken(id)
    };
  });
  
  res.render('live-cricket', {
    title: 'Live Cricket',
    page: 'live-cricket',
    channels: pageChannels,
    matches: upcomingMatches,
    isMobile: isMobileDevice(req)
  });
});

// All Channels route
app.get('/all-channels', (req, res) => {
  res.render('all-channels', {
    title: 'All Channels',
    page: 'all-channels',
    isMobile: isMobileDevice(req)
  });
});

// Match schedule page
app.get('/schedule', (req, res) => {
  // Get upcoming matches
  const upcomingMatches = markTodayMatches(getUpcomingMatches());
  
  res.render('schedule', {
    title: 'IPL Match Schedule',
    page: 'schedule',
    matches: upcomingMatches
  });
});

// Generate a secure streaming token
app.get('/api/generate-token', (req, res) => {
  // Check if the request is from our site
  if (!isValidReferrer(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const channelId = req.query.channel;
  const pageToken = req.query.token;
  
  // Verify the page token
  const expectedToken = generateChannelToken(channelId);
  if (pageToken !== expectedToken) {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  // Channel exists check
  if (!channels[channelId]) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  
  // Generate a time-limited token
  const streamToken = generateTimeToken(channelId);
  
  // Return the token
  res.json({ token: streamToken });
});

// Secure stream player
app.get('/stream', (req, res) => {
  const streamToken = req.query.token;
  const isMobile = isMobileDevice(req);
  
  // Verify the token
  const channelId = verifyTimeToken(streamToken);
  
  if (!channelId || !channels[channelId]) {
    return res.status(403).render('error', {
      title: 'Error',
      message: 'Invalid or expired stream token'
    });
  }
  
  // Get the channel info
  const channel = channels[channelId];
  
  // Serve the player with the actual stream
  res.render('player', {
    title: `${channel.name} Stream`,
    channel: channel,
    streamSource: channel.streamSource,
    isMobile: isMobile
  });
});

// Direct stream for mobile devices (no sandbox)
app.get('/direct-stream', (req, res) => {
  const streamToken = req.query.token;
  
  // Verify the token
  const channelId = verifyTimeToken(streamToken);
  
  if (!channelId || !channels[channelId]) {
    return res.status(403).render('error', {
      title: 'Error',
      message: 'Invalid or expired stream token'
    });
  }
  
  // Get the channel info
  const channel = channels[channelId];
  
  // Render a simple page that directly embeds the stream iframe without sandbox
  res.render('direct-player', {
    title: `${channel.name} Stream`,
    channel: channel,
    streamSource: channel.streamSource
  });
});

// Channel pages
app.get('/ipl20-watch/:token', (req, res) => {
  const pageToken = req.params.token;
  const isMobile = isMobileDevice(req);
  let matchedChannel = null;
  
  // Find the channel that matches this token
  Object.keys(channels).forEach(id => {
    if (generateChannelToken(id) === pageToken) {
      matchedChannel = id;
    }
  });
  
  if (!matchedChannel) {
    return res.status(404).render('error', {
      title: 'Error',
      message: 'Channel not found'
    });
  }
  
  // Get upcoming matches
  const upcomingMatches = markTodayMatches(getUpcomingMatches());
  
  res.render('channel', {
    title: channels[matchedChannel].name,
    page: 'channel',
    channel: channels[matchedChannel],
    channelId: matchedChannel,
    pageToken: pageToken,
    tournamentType: 'ipl',
    matches: upcomingMatches,
    isMobile: isMobile
  });
});

// Error page for 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'The page you requested could not be found.'
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

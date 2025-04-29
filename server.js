// server.js - Simple version with mobile device detection
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

// Sample IPL schedule data - normally this would come from a database or JSON file
const iplMatches = [
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

// Function to filter and mark today's matches
function getUpcomingMatches() {
  const today = new Date();
  
  // Parse date from format like "30th Apr"
  function parseDate(dateStr) {
    const dateParts = dateStr.match(/(\d+)(st|nd|rd|th) (\w+)/);
    if (!dateParts) return null;
    
    const day = parseInt(dateParts[1]);
    const month = dateParts[3];
    const monthMap = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    return new Date(today.getFullYear(), monthMap[month], day);
  }
  
  // Check if a date is today
  function isToday(date) {
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }
  
  // Filter and mark matches
  return iplMatches.map(match => {
    const matchDate = parseDate(match.date);
    const isMatchToday = matchDate ? isToday(matchDate) : false;
    
    return {
      ...match,
      isToday: isMatchToday
    };
  }).filter(match => {
    const matchDate = parseDate(match.date);
    // Keep only today's and future matches
    return matchDate && (matchDate >= today || match.isToday);
  });
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
  const isMobile = isMobileDevice(req);
  const upcomingMatches = getUpcomingMatches();
  
  res.render('ipl20', {
    title: 'IPL20 Streaming',
    page: 'ipl20',
    channels: channels,
    defaultChannel: 'starSports',
    matches: upcomingMatches,
    isMobile: isMobile
  });
});

// PSLT20 route
app.get('/pslt20', (req, res) => {
  const isMobile = isMobileDevice(req);
  
  res.render('pslt20', {
    title: 'PSLT20 Streaming',
    page: 'pslt20',
    channels: channels,
    defaultChannel: 'ptvSports',
    isMobile: isMobile
  });
});

// Live Cricket route
app.get('/live-cricket', (req, res) => {
  const isMobile = isMobileDevice(req);
  const upcomingMatches = getUpcomingMatches();
  
  res.render('live-cricket', {
    title: 'Live Cricket',
    page: 'live-cricket',
    channels: channels,
    matches: upcomingMatches,
    isMobile: isMobile
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

// Match schedule page
app.get('/schedule', (req, res) => {
  const upcomingMatches = getUpcomingMatches();
  
  res.render('schedule', {
    title: 'IPL Match Schedule',
    page: 'schedule',
    matches: upcomingMatches
  });
});

// Player page - handles both direct stream and iframe embedding
app.get('/player/:channelId', (req, res) => {
  const channelId = req.params.channelId;
  const isMobile = isMobileDevice(req);
  
  // Check if channel exists
  if (!channels[channelId]) {
    return res.status(404).render('error', {
      title: 'Channel Not Found',
      message: 'The requested channel was not found.'
    });
  }
  
  res.render('player', {
    title: `${channels[channelId].name} - Live Stream`,
    channel: channels[channelId],
    channelId: channelId,
    isMobile: isMobile
  });
});

// Channel pages
app.get('/channel/:type/:channelId', (req, res) => {
  const type = req.params.type;
  const channelId = req.params.channelId;
  const isMobile = isMobileDevice(req);
  
  // Check if channel exists
  if (!channels[channelId]) {
    return res.status(404).render('error', {
      title: 'Channel Not Found',
      message: 'The requested channel was not found.'
    });
  }
  
  const upcomingMatches = getUpcomingMatches();
  
  res.render('channel', {
    title: channels[channelId].name,
    page: 'channel',
    channel: channels[channelId],
    channelId: channelId,
    tournamentType: type, // 'ipl' or 'psl'
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

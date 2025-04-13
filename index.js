const express = require('express');
const cors = require('cors');
const { igdl } = require('btch-downloader');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup EJS and public folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Home route (renders EJS page)
app.get('/', (req, res) => {
  res.render('home');
});

// API endpoint for downloading
app.get('/api/download', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'URL parameter is required'
    });
  }

  try {
    const data = await igdl(url);

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No media found for this URL'
      });
    }

    const media = data.map(item => ({
      url: item.url,
      thumbnail: item.thumbnail,
      type: item.url.includes('video') ? 'video' : 'image'
    }));

    return res.json({ success: true, media });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 404 for other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

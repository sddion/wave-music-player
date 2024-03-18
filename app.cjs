const express = require('express');
const app = express();
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const { join } = require('path');
const exec = promisify(require('child_process').exec);

const MUSIC_DIR = path.join(__dirname, 'songs');
app.use(express.static('public'));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  debug(err.stack); 
  res.status(500).send('Something went wrong!');
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/songs/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(MUSIC_DIR, encodeURIComponent(filename));
    const stat = await fs.promises.stat(filePath); 
    if (!stat.isFile()) {
      throw new Error('File not found');
    }
    res.sendFile(filePath);
  } catch (error) {
    console.error(`Error serving song: ${error}`);
    debug(error.stack); 
    res.status(404).send('File not found');
  }
});


(async () => {
  try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error}`);
    debug(error.stack);
    process.exit(1);
  }
})();

const express = require('express');
const app = express();
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const { join } = require('path');
const exec = promisify(require('child_process').exec);

const MUSIC_DIR = path.join(__dirname, 'songs');
const METADATA_DIR = path.join(__dirname, 'metadata');

app.use(express.static('public'));
app.use('/songs', express.static(MUSIC_DIR)); 
app.use(express.static(METADATA_DIR));


app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/songs/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(MUSIC_DIR, encodeURIComponent(filename));
    const stat = fs.stat(filePath);
    if (!stat.isFile()) {
      throw new Error('File not found');
    }
    res.sendFile(filePath);
  } catch (error) {
    console.error(`Error serving song: ${error}`);
    res.status(404).send('File not found');
  }
});


class MusicPlayer {
  constructor(musicDir) {
    this.musicDir = path.resolve(musicDir); 
    this.metadataDir = path.resolve(METADATA_DIR);
    this.currentSong = { title: '', artist: '', duration: 0, filename: '' };
    this.remainingSongs = [];
    this.currentIndex = 0;
  }

  async initialize() {
    try {
      const files = await this.getMusicFiles();
      if (files.length === 0) {
        throw new Error('No music files found in the directory.');
      }
      this.remainingSongs = files;
    } catch (error) {
      console.error(`Error initializing music player: ${error}`);
      throw error;
    }
  }

  async getMusicFiles() {
    try {
      const files = await fs.promises.readdir(this.musicDir);
      return files.filter(file => file.endsWith('.mp3'));
    } catch (error) {
      console.error(`Error reading music files: ${error}`);
      throw error;
    }
  }

  async play() {
    try {
      if (this.currentIndex >= this.remainingSongs.length) {
        this.currentIndex = 0;
      }
      const currentSong = this.remainingSongs[this.currentIndex];
      this.currentIndex++;
      return currentSong;
    } catch (error) {
      console.error(`Error in play: ${error}`);
      throw error;
    }
  }
}

const player = new MusicPlayer(MUSIC_DIR);

(async () => {
  try {
    await player.initialize();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();

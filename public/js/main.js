const progressbar = document.querySelector(".progress");
const song = document.getElementById("song");
const songsDataElement = document.getElementById("songs-data");
const songsDataString = songsDataElement.dataset.songs;
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const songName = document.querySelector(".music-player h1");
const artistName = document.querySelector(".music-player p");
const searchInput = document.getElementById('search');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeatBtn');
const controlIcon = document.getElementById('controlIcon');
const timer = document.getElementById('timer');

let songs = [];
let repeatMode = 'off';


try {
  const songsDataString = songsDataElement.dataset.songs;
  if (!songsDataString) {
    throw new Error("Song data string is undefined or empty.");
  }
  
  const songsData = JSON.parse(songsDataString);
  if (!Array.isArray(songsData) || songsData.length === 0) {
    throw new Error("Invalid or empty song data array.");
  }
  
  songsData.forEach(songData => {
    const song = new Audio();
    song.src = songData.source;
    song.title = songData.title;
    song.name = songData.name;
    songs.push(song);
  });
} catch (error) {
  console.error("Error loading song data:", error);
}

let currentSongIndex = 3;

function updateSongInfo() {
  if (songs.length > 0 && currentSongIndex >= 0 && currentSongIndex < songs.length) {
    songName.textContent = songs[currentSongIndex].title;
    artistName.textContent = songs[currentSongIndex].name;
    song.src = songs[currentSongIndex].src;

    song.addEventListener("loadeddata", function () {});
  } else {
    console.error("No song data available or invalid currentSongIndex.");
  }
}

song.addEventListener("timeupdate", function () {
  if (!song.paused) {
    const progressPercent = (song.currentTime / song.duration) * 100;
    progress.value = song.currentTime;
    updateProgressBar(progressPercent);

  
    if (song.currentTime >= song.duration) {
      handleRepeat(); 
    }
  }
});

song.addEventListener("loadedmetadata", function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
});

function pauseSong() {
  song.pause();
  controlIcon.classList.remove("fa-pause");
  controlIcon.classList.add("fa-play");
}

function playSong() {
  if (song.src && song.src !== "undefined") {
    song.play();
    controlIcon.classList.add("fa-pause");
    controlIcon.classList.remove("fa-play");
  } else {
    console.error("The media resource is not suitable or undefined.");
  }
}

function playPause() {
  if (song.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

playPauseButton.addEventListener("click", playPause);

progress.addEventListener("change", function () {
  playSong();
});

forwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

backwardButton.addEventListener("click", function () {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
  playPause();
});

updateSongInfo();

var swiper = new Swiper(".swiper", {
  effect: "coverflow",
  centeredSlides: true,
  initialSlide: 3,
  slidesPerView: "auto",
  allowTouchMove: true,
  spaceBetween: 40,
  coverflowEffect: {
    rotate: 25,
    stretch: 0,
    depth: 50,
    modifier: 1,
    slideShadows: true,
  },
  navigation: {
    nextEl: ".forward",
    prevEl: ".backward",
  },
});


document.querySelectorAll('.swiper-slide').forEach((slide, index) => {
  slide.addEventListener('click', () => {
      playSelectedSong(index);
  });
  slide.addEventListener('mouseenter', () => {
      slide.classList.add('hovered');
  });
  slide.addEventListener('mouseleave', () => {
      slide.classList.remove('hovered');
  });
});

// Function to play the selected song
function playSelectedSong(index) {
  currentSongIndex = index;
  updateSongInfo();
  playSong();
}

// Search functionality
function updateSearchResults(results) {
  const searchResultsContainer = document.getElementById('search-results');
  searchResultsContainer.innerHTML = ''; 
  
  results.forEach((result, index) => {
    const searchResultItem = document.createElement('div');
    searchResultItem.classList.add('search-result-item');
    searchResultItem.textContent = result.title;
    searchResultItem.addEventListener('click', () => {
      playSelectedSong(index);
      searchResultsContainer.innerHTML = '';
    });
    searchResultsContainer.appendChild(searchResultItem);
  });
}

function searchSong() {
  const searchTerm = searchInput.value.toLowerCase();
  const searchResults = songs.filter(song => song.title.toLowerCase().includes(searchTerm));
  updateSearchResults(searchResults);
}


let isShuffle = false;
shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

function toggleRepeat() {
  if (repeatMode === 'off') {
      repeatMode = 'single';
  } else {
      repeatMode = 'off';
  }
  updateRepeatButton();
}

function updateRepeatButton() {
  repeatBtn.classList.remove('active',  'single');

  if (repeatMode === 'off') {
  } else if (repeatMode === 'single') {
      repeatBtn.classList.add('active', 'single');
  } else {
      repeatBtn.classList.add('active');
  }
}

function shuffleSongs() {
  for (let i = songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songs[i], songs[j]] = [songs[j], songs[i]];
  }
  updateSongInfo()
}

// Function to handle the repeat logic when a song ends
async function handleRepeat() {
  if (repeatMode === 'off') {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
      updateSongInfo();
      playSong();
  } else if (repeatMode === 'single') {
      playSameSong();
  }
}

function playSameSong() {
  updateSongInfo();
  progress.value = 0;
  playSong(); 
}

function updateProgressBar(progress) {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = progress + '%';
}

updateProgressBar(100);

function hideSearchResults() {
  const searchResultsContainer = document.getElementById('search-results');
  searchResultsContainer.innerHTML = ''; 
}

document.addEventListener('click', function(event) {
  const searchContainer = document.querySelector('.search-container');
  const searchResultsContainer = document.getElementById('search-results');

  if (!searchContainer.contains(event.target) && event.target !== searchResultsContainer) {
    hideSearchResults(); 
  }
});

song.addEventListener('ended', handleRepeat);
repeatBtn.addEventListener('click', toggleRepeat);
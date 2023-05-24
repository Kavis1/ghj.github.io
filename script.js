const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const topSongsContainer = document.getElementById('top-songs-container');
let currentAudio = null;
let currentIndex = 0;

function searchTracks(query) {
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=048b42db&format=json&limit=10&search=${encodeURIComponent(query)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      displayResults(data.results);
    })
    .catch(error => {
      console.error(error);
    });
}


function displayResults(results) {
  resultsContainer.innerHTML = '';

  if (results.length > 0) {
    results.forEach((track) => {
      const songElement = createSongElement(track);
      resultsContainer.appendChild(songElement);
    });
  } else {
    const noResultsElement = document.createElement('div');
    noResultsElement.innerText = 'По вашему запросу ничего не найдено.';
    resultsContainer.appendChild(noResultsElement);
  }
}

function displayTopSongs(songs) {
  topSongsContainer.innerHTML = '';

  songs.forEach((song) => {
    const songElement = createSongElement(song);
    topSongsContainer.appendChild(songElement);
  });
}

function createSongElement(song) {
  const songElement = document.createElement('div');
  songElement.className = 'song';

  const titleElement = document.createElement('strong');
  titleElement.innerText = song.name;

  const separatorElement = document.createElement('span');
  separatorElement.innerText = ' - ';

  const artistElement = document.createElement('span');
  artistElement.innerText = song.artist_name;

  songElement.appendChild(titleElement);
  songElement.appendChild(separatorElement);
  songElement.appendChild(artistElement);


  const playStopButton = document.createElement('button');
  playStopButton.className = 'play-stop-button';
  playStopButton.innerHTML = '<i class="fas fa-play"></i>';

  const controlsElement = document.createElement('div');
  controlsElement.className = 'controls';

  const progressContainer = document.createElement('div');
  progressContainer.className = 'progress-container';

  const durationElement = document.createElement('span');
  durationElement.className = 'duration';
  durationElement.innerText = '00:00';

  const progressSlider = document.createElement('input');
  progressSlider.type = 'range';
  progressSlider.className = 'progress-slider';
  progressSlider.min = 0;
  progressSlider.value = 0;
  progressSlider.addEventListener('input', () => {
    if (currentAudio) {
      currentAudio.currentTime = progressSlider.value;
    }
  });

  progressContainer.appendChild(durationElement);
  progressContainer.appendChild(progressSlider);

  controlsElement.appendChild(playStopButton);
  controlsElement.appendChild(progressContainer);

  // Volume controls
  const volumeContainer = document.createElement('div');
  volumeContainer.className = 'volume-container';

  const volumeIcon = document.createElement('i');
  volumeIcon.className = 'fas fa-volume-up';

  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.className = 'volume-slider';
  volumeSlider.min = 0;
  volumeSlider.max = 1;
  volumeSlider.step = 0.1;
  volumeSlider.value = 1;
  volumeSlider.addEventListener('input', () => {
    if (currentAudio) {
      currentAudio.volume = volumeSlider.value;
    }
  });

  volumeContainer.appendChild(volumeIcon);
  volumeContainer.appendChild(volumeSlider);

  controlsElement.appendChild(volumeContainer);

  songElement.appendChild(controlsElement);

  function playTrack() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.removeEventListener('timeupdate', updateProgress);
    }

    currentAudio = new Audio(song.audio);
    currentAudio.addEventListener('timeupdate', updateProgress);
    currentAudio.addEventListener('ended', playNextTrack);
    currentAudio.play();
  }

  function stopTrack() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.removeEventListener('timeupdate', updateProgress);
      currentAudio.removeEventListener('ended', playNextTrack);
      currentAudio = null;
    }
  }

  function updateProgress() {
    if (currentAudio) {
      const currentTime = currentAudio.currentTime;
      const duration = currentAudio.duration;
      const percentProgress = (currentTime / duration) * 100;
      const progressSlider = controlsElement.querySelector('.progress-slider');
      const durationElement = controlsElement.querySelector('.duration');
      progressSlider.value = currentTime;
      durationElement.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
      progressSlider.style.background = `linear-gradient(to right, #4caf50 0%, #4caf50 ${percentProgress}%, #fff ${percentProgress}%, #fff 100%)`;
      progressSlider.max = duration;
      if (currentTime >= duration - 0.5) {
        stopTrack();
      }
    }
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${padTime(minutes)}:${padTime(seconds)}`;
  }

  function padTime(value) {
    return value.toString().padStart(2, '0');
  }

  function playNextTrack() {
    const songs = Array.from(document.querySelectorAll('.song'));
    const nextIndex = currentIndex + 1;

    if (nextIndex < songs.length) {
      const nextSong = songs[nextIndex];
      nextSong.querySelector('.play-stop-button').click();
      currentIndex = nextIndex;
    }
  }

  function togglePlayStop() {
    if (currentAudio && !currentAudio.paused && currentAudio.src === song.audio) {
      currentAudio.pause();
      playStopButton.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      playTrack();
      playStopButton.innerHTML = '<i class="fas fa-pause"></i>';
      
      if (currentAudio) {
        currentAudio.volume = controlsElement.querySelector('.volume-slider').value;
      }
    }
  }

  playStopButton.addEventListener('click', togglePlayStop);

  songElement.addEventListener('mouseenter', () => {
    controlsElement.style.display = 'block';
  });

  songElement.addEventListener('mouseleave', () => {
    if (!currentAudio || currentAudio.src !== song.audio) {
      controlsElement.style.display = 'none';
    }
  });

  return songElement;
}

function getTopSongs() {
  const randomSeed = Date.now(); // сид для рандома
  const url = `https://api.jamendo.com/v3.0/tracks/?client_id=048b42db&format=json&limit=30&random=true&groupby=artist_id&seed=${randomSeed}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const randomSongs = getRandomSongs(data.results);
      displayTopSongs(randomSongs);
    })
    .catch(error => {
      console.error(error);
    });
}

function getRandomSongs(songs) {
  const shuffledSongs = shuffleArray(songs);
  return shuffledSongs.slice(0, 30);
}

function shuffleArray(array) {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

// Event listeners
searchInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    searchTracks(this.value); // Вызов функции поиска при нажатии Enter
  }
});

getTopSongs();

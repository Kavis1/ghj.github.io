const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const topSongsContainer = document.getElementById('top-songs-container');
let currentAudio = null;
let currentIndex = 0;

// Function to perform track search
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

// Function to display search results
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

// Function to display top songs in the sidebar
function displayTopSongs(songs) {
  topSongsContainer.innerHTML = '';

  songs.forEach((song) => {
    const songElement = createSongElement(song);
    topSongsContainer.appendChild(songElement);
  });
}

// Function to create a song element
function createSongElement(song) {
  const songElement = document.createElement('div');
  songElement.className = 'song';

  const titleElement = document.createElement('strong');
  titleElement.innerText = song.name;

  const artistElement = document.createElement('span');
  artistElement.innerText = song.artist_name;

  songElement.appendChild(titleElement);
  songElement.appendChild(artistElement);

  let controlsElement;
  let isPlaying = false;
  let volume = 1;

  // Create controls
  function createControls() {
    if (!controlsElement) {
      controlsElement = createControlsElement(song.audio);
      songElement.appendChild(controlsElement);
    }
  }

  // Remove controls
  function removeControls() {
    if (controlsElement) {
      songElement.removeChild(controlsElement);
      controlsElement = null;
    }
  }

  // Show controls on song element or controls element hover
  songElement.addEventListener('mouseover', createControls);

  // Hide controls on song element or controls element mouseout
  songElement.addEventListener('mouseout', function (event) {
    const toElement = event.relatedTarget || event.toElement;
    if (!songElement.contains(toElement)) {
      removeControls();
    }
  });

  // Function to play the track
  function playTrack() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(song.audio);
    currentAudio.volume = volume;
    currentAudio.play();
    currentAudio.addEventListener('ended', playNextTrack);
    isPlaying = true;
  }

  // Function to stop the track
  function stopTrack() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.removeEventListener('ended', playNextTrack);
      currentAudio = null;
      isPlaying = false;
    }
  }

  // Function to play the next track
  function playNextTrack() {
    if (isPlaying) {
      const songs = Array.from(document.querySelectorAll('.song'));
      const nextIndex = currentIndex + 1;

      if (nextIndex < songs.length) {
        const nextSong = songs[nextIndex];
        nextSong.querySelector('.play-button').click();
        currentIndex = nextIndex;
      }
    }
  }

  // Create controls element
  function createControlsElement(audioUrl) {
    const controlsElement = document.createElement('div');
    controlsElement.className = 'controls';

    const playButton = document.createElement('button');
    playButton.className = 'play-button';
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.addEventListener('click', playTrack);

    const stopButton = document.createElement('button');
    stopButton.className = 'stop-button';
    stopButton.innerHTML = '<i class="fas fa-stop"></i>';
    stopButton.addEventListener('click', stopTrack);

    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.className = 'volume-slider';
    volumeSlider.min = 0;
    volumeSlider.max = 1;
    volumeSlider.step = 0.1;
    volumeSlider.value = volume;
    volumeSlider.addEventListener('input', () => {
      volume = volumeSlider.value;
      if (currentAudio) {
        currentAudio.volume = volume;
      }
    });

    controlsElement.appendChild(playButton);
    controlsElement.appendChild(stopButton);
    controlsElement.appendChild(volumeSlider);

    return controlsElement;
  }

  return songElement;
}


//Генерация рандом песен
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

// поиск по нажатию
function search() {
  const searchTerm = searchInput.value;
  searchTracks(searchTerm);
}

// обнова рандом треков
getTopSongs();

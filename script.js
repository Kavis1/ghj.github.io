const clientId = 'baba9cfc78cf49f7a85359fddf2745b6'; // Замените YOUR_CLIENT_ID на свой идентификатор клиента
const clientSecret = '521f5450966d45d28f0756c674d31340'; // Замените YOUR_CLIENT_SECRET на свой клиентский секрет

const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');

// Функция для получения токена доступа
async function getToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  const accessToken = data.access_token;
  return accessToken;
}

// Функция для выполнения поиска треков
async function searchTracks(query, accessToken) {
  const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
  return data.tracks.items;
}

// Функция для отображения результатов поиска
function displayResults(results) {
  resultsContainer.innerHTML = '';

  if (results.length > 0) {
    results.forEach((track) => {
      const songElement = document.createElement('div');
      songElement.className = 'song';
      songElement.innerHTML = `<strong>${track.name}</strong> - ${track.artists[0].name}`;
      resultsContainer.appendChild(songElement);
    });
  } else {
    const noResultsElement = document.createElement('div');
    noResultsElement.innerText = 'По вашему запросу ничего не найдено.';
    resultsContainer.appendChild(noResultsElement);
  }
}

// Функция для выполнения поиска при нажатии на кнопку
function search() {
  const searchTerm = searchInput.value;

  getToken()
    .then(token => {
      searchTracks(searchTerm, token)
        .then(results => {
          displayResults(results);
        })
        .catch(error => {
          console.error(error);
        });
    })
    .catch(error => {
      console.error(error);
    });
}

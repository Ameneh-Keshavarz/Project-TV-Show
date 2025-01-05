let shows = []; // To store available shows
let episodes = []; // To store episodes for the selected show
let currentShowId = null; // To track the current selected show
const cache = {}; // Cache to store fetched data

function initializeApp() {
  const searchStatus = document.getElementById("search-status");
  searchStatus.textContent = "Loading shows... Please wait.";

  fetchShows()
    .then(() => {
      populateShows(shows);
      populateShowSelect(shows); // Populate the show select dropdown
      searchStatus.textContent = ''; // Clear the loading message
    })
    .catch((error) => {
      handleError(error);
    });
}

async function fetchShows() {
  if (cache.shows) {
    shows = cache.shows;
    return;
  }

  try {
    const url = "https://api.tvmaze.com/shows";
    if (sessionStorage.getItem(url)) {
      shows = JSON.parse(sessionStorage.getItem(url));
      return;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch shows.");
    }
    shows = await response.json();
    shows.sort((a, b) => a.name.localeCompare(b.name));
    sessionStorage.setItem(url, JSON.stringify(shows)); // Store fetched shows in sessionStorage
    cache.shows = shows;
  } catch (error) {
    throw new Error("Failed to fetch shows.");
  }
}

function populateShows(showList) {
  const showsListing = document.getElementById("shows-listing");
  showsListing.innerHTML = ""; // Clear existing shows

  showList.forEach((show) => {
    const card = createShowCard(show);
    card.addEventListener("click", () => {
      currentShowId = show.id; // Track selected show
      fetchEpisodes(show.id)
        .then(() => {
          displayEpisodes(episodes);
          populateEpisodeSelect();  // Populate episode select dropdown
          toggleView("episodes"); // Switch to episodes view
        })
        .catch((error) => {
          handleError(error);
        });
    });
    showsListing.appendChild(card);
  });

  // Update the search count for shows
  const searchCountShows = document.getElementById("search-count-shows");
  searchCountShows.textContent = `Displaying ${showList.length} / ${shows.length} shows`;
}

function populateShowSelect(showList) {
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = '<option value="">Select a Show</option>'; // Clear previous options

  showList.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  // Add an event listener to the dropdown to update the display when a show is selected
  showSelect.addEventListener("change", (event) => {
    const selectedShowId = event.target.value;
    if (selectedShowId) {
      currentShowId = selectedShowId;
      fetchEpisodes(selectedShowId)
        .then(() => {
          displayEpisodes(episodes);
          populateEpisodeSelect(); // Populate episode select dropdown
          toggleView("episodes"); // Switch to episodes view
        })
        .catch((error) => {
          handleError(error);
        });
    }
  });
}

function createShowCard(show) {
  const card = document.createElement("div");
  card.classList.add("card");

  // Shorten the summary to 300 characters
  const shortenedSummary = show.summary ? show.summary.substring(0, 300) + '...' : 'No summary available.';

  card.innerHTML = `
    <img src="${show.image ? show.image.medium : ''}" alt="${show.name}">
    <div class="card-content">
      <h3>${show.name}</h3>
      <p>${shortenedSummary}</p>
    </div>
    <div class="show-info-box">
      <p><strong>Rating:</strong> ${show.rating.average || 'N/A'}</p>
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Runtime:</strong> ${show.runtime || 'N/A'} mins</p>
    </div>
  `;
  return card;
}

function toggleView(view) {
  const showsListing = document.getElementById("shows-listing");
  const episodesSection = document.getElementById("episodes-section");
  const backToShows = document.getElementById("back-to-shows");
  const showSelectSection = document.getElementById("show-select-section");
  const showSelect = document.getElementById("show-select");

  if (view === "episodes") {
    showsListing.style.display = "none";
    episodesSection.style.display = "block";
    backToShows.style.display = "inline-block"; // Show the back button
    showSelectSection.style.display = "none";  // Hide the show search and select

    // Clear the search input for shows when switching to episodes
    document.getElementById("search-input").value = "";

    // Clear the show select dropdown when moving to episodes
    showSelect.selectedIndex = 0; // Reset the dropdown to "Select a Show"
    
    // Display all episodes when switching to episodes
    displayEpisodes(episodes);  // This will show all episodes without filtering
  } else if (view === "shows") {
    showsListing.style.display = "flex";
    episodesSection.style.display = "none";
    backToShows.style.display = "none"; // Hide the back button
    showSelectSection.style.display = "block";  // Show the show search and select

    // Clear the search input for episodes when switching back to shows
    document.getElementById("search-input-episodes").value = "";

    // Clear the show select dropdown when switching back to shows
    showSelect.selectedIndex = 0; // Reset the dropdown to "Select a Show"
    
    // Display all shows when switching back to shows
    populateShows(shows);  // This will show all shows without filtering
  }
}

async function fetchEpisodes(showId) {
  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
  if (sessionStorage.getItem(url)) {
    episodes = JSON.parse(sessionStorage.getItem(url));
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch episodes.");
    }
    episodes = await response.json();
    sessionStorage.setItem(url, JSON.stringify(episodes)); // Store fetched episodes in sessionStorage
    cache[`episodes_${showId}`] = episodes;
  } catch (error) {
    throw new Error("Failed to fetch episodes.");
  }
}

function displayEpisodes(episodeList) {
  const episodeListContainer = document.getElementById("episode-list");
  episodeListContainer.innerHTML = ""; // Clear previous content

  if (episodeList.length === 0) {
    const noEpisodesMessage = document.createElement("p");
    noEpisodesMessage.textContent = "No episodes to display.";
    episodeListContainer.appendChild(noEpisodesMessage);
    return;
  }

  episodeList.forEach((episode) => {
    const card = createEpisodeCard(episode);
    episodeListContainer.appendChild(card);
  });

  const searchCount = document.getElementById("search-count");
  searchCount.textContent = `Displaying ${episodeList.length} / ${episodes.length} episodes`;
}

function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.classList.add("card");

  const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

  // Shorten the episode summary to 300 characters
  const shortenedSummary = episode.summary ? episode.summary.substring(0, 300) + '...' : 'No summary available.';

  card.innerHTML = `
    <img src="${episode.image ? episode.image.medium : ''}" alt="${episode.name}">
    <div class="card-content">
      <h3>${episode.name} - ${episodeCode}</h3>
      <p>${shortenedSummary}</p>
      <a href="${episode.url}" target="_blank">More info</a>
    </div>
  `;

  return card;
}

function populateEpisodeSelect() {
  const episodeSelect = document.getElementById("episode-select");
  episodeSelect.innerHTML = '<option value="">All Episodes</option>'; // Clear previous options

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    option.value = episode.id;
    option.textContent = `${episode.name} (${episodeCode})`;
    episodeSelect.appendChild(option);
  });
}

function searchShows(event) {
  const searchText = event.target.value.toLowerCase();

  const filteredShows = shows.filter(show =>
    show.name.toLowerCase().includes(searchText) ||
    show.genres.some(genre => genre.toLowerCase().includes(searchText)) ||
    show.summary.toLowerCase().includes(searchText)
  );

  populateShows(filteredShows);

  // Update the search count for shows
  const searchCountShows = document.getElementById("search-count-shows");
  searchCountShows.textContent = `Displaying ${filteredShows.length} / ${shows.length} shows`;
}

document.getElementById("search-input").addEventListener("input", searchShows);

document.getElementById("search-input-episodes").addEventListener("input", (event) => {
  const searchText = event.target.value.toLowerCase();
  const selectedEpisodeId = document.getElementById("episode-select").value;

  let filteredEpisodes = episodes.filter(episode =>
    episode.name.toLowerCase().includes(searchText) ||
    episode.summary.toLowerCase().includes(searchText)
  );

  if (selectedEpisodeId) {
    filteredEpisodes = filteredEpisodes.filter(episode => episode.id == selectedEpisodeId);
  }

  displayEpisodes(filteredEpisodes);
});

document.getElementById("episode-select").addEventListener("change", (event) => {
  const selectedEpisodeId = event.target.value;
  const searchText = document.getElementById("search-input-episodes").value.toLowerCase();

  let filteredEpisodes = episodes.filter(episode =>
    episode.name.toLowerCase().includes(searchText) ||
    episode.summary.toLowerCase().includes(searchText)
  );

  if (selectedEpisodeId) {
    filteredEpisodes = filteredEpisodes.filter(episode => episode.id == selectedEpisodeId);
  }

  displayEpisodes(filteredEpisodes);
});

document.getElementById("back-to-shows").addEventListener("click", () => {
  toggleView("shows");
});

function handleError(error) {
  const searchStatus = document.getElementById("search-status");
  searchStatus.textContent = `Error: ${error.message}`;
}

window.onload=initializeApp();
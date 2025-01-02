let allShows = []; 
let cachedEpisodes = {};

function setup() {
  const rootElem = document.getElementById("root");

  const showSelect = document.createElement("select");
  showSelect.id = "showSelect";
  showSelect.addEventListener("change", onShowSelect);
  fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((shows) => {
      allShows = shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      populateShowDropdown(allShows);
    })
    .catch((error) => {
      console.error("Error fetching shows:", error);
      rootElem.textContent = "Failed to load shows. Please try again later.";
    });
  rootElem.appendChild(showSelect);
}
function populateShowDropdown(shows) {
  const showSelect = document.getElementById("showSelect");
  showSelect.innerHTML = '<option value="">Select a Show</option>'; // Default option

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}
function onShowSelect(event) {
  const showId = event.target.value;

  if (!showId) {
    document.getElementById("root").textContent = "Please select a show.";
    return;
  }

  // Check if episodes for this show are already cached
  if (cachedEpisodes[showId]) {
    makePageForEpisodes(cachedEpisodes[showId]);
  } else {
    // Fetch episodes for the selected show
    fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
      .then((response) => response.json())
      .then((episodes) => {
        cachedEpisodes[showId] = episodes; // Cache episodes
        makePageForEpisodes(episodes);
      })
      .catch((error) => console.error("Error fetching episodes:", error));
  }
}
async function fetchEpisodes() {
  try {
    const response = await fetch('https://api.tvmaze.com/shows/82/episodes');
    if (!response.ok) {
      throw new Error('Failed to fetch episode data');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

function makePageForEpisodes(episodeList) {
  
  const rootElem = document.getElementById("root");
  rootElem.textContent = '';
  const showSelect = document.createElement("select");
  showSelect.id = "showSelect";
  showSelect.addEventListener("change", onShowSelect);
  fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((shows) => {
      allShows = shows.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      populateShowDropdown(allShows);
    })
    .catch((error) => {
      console.error("Error fetching shows:", error);
      rootElem.textContent = "Failed to load shows. Please try again later.";
    });
  rootElem.appendChild(showSelect);
  // Remove loading message
  const loadingMessage = document.querySelector('p');
  if (loadingMessage) {
    loadingMessage.remove();
  }

  // Create the control row with select, search, and episode count
  
  const controlRow = document.createElement('div');
  controlRow.classList.add('control-row');

  const episodeSelector = document.createElement('select');
  episodeSelector.classList.add('episode-selector');

  const searchWrapper = document.createElement('div');
  searchWrapper.classList.add('search-wrapper');

  const form = document.createElement('form');

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'focus';
  input.classList.add('search-box');
  input.placeholder = 'Enter search term';

  form.appendChild(input);
  searchWrapper.appendChild(form);

  const episodeCountText = document.createElement('span');
  episodeCountText.classList.add('episode-count');
  episodeCountText.style.fontSize = '1rem';
  episodeCountText.style.color = '#333';

  controlRow.appendChild(episodeSelector);
  controlRow.appendChild(searchWrapper);
  controlRow.appendChild(episodeCountText);

  rootElem.appendChild(controlRow);

  const episodeContainer = document.createElement('div');
  episodeContainer.classList.add('episode-container');
  rootElem.appendChild(episodeContainer);

  function renderEpisodes(episodes) {
    const fragment = document.createDocumentFragment(); // Use fragment for better performance
    if (episodes.length === 0) {
      episodeContainer.innerHTML = '<p>No episodes match your search.</p>';
      return;
    }

    episodes.forEach((episode) => {
      const episodeCard = document.createElement('div');
      episodeCard.classList.add('episode-card');

      const episodeCode = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;

      episodeCard.innerHTML = `
        <h2>${episode.name}</h2>
        <p><strong>Episode Code:</strong> ${episodeCode}</p>
        <p><strong>Season:</strong> ${episode.season}</p>
        <p><strong>Episode:</strong> ${episode.number}</p>
        <img src="${episode.image.medium || 'fallback_image_url.jpg'}" alt="${episode.name}" />
        <p><strong>Summary:</strong> ${episode.summary}</p>
        <p><a href="https://www.tvmaze.com/episodes/${episode.id}" target="_blank">More Info on TVMaze</a></p>
      `;

      fragment.appendChild(episodeCard);  // Append to fragment
    });

    episodeContainer.innerHTML = ''; // Clear existing content
    episodeContainer.appendChild(fragment); // Append all at once for better performance
  }

  function populateSelector(episodes) {
    episodeSelector.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.textContent = 'Select an Episode';
    defaultOption.value = '';
    episodeSelector.appendChild(defaultOption);

    episodes.forEach((episode) => {
      const option = document.createElement('option');
      const episodeCode = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;
      option.textContent = `${episodeCode} - ${episode.name}`;
      option.value = episode.id;
      episodeSelector.appendChild(option);
    });
  }

  function updateEpisodeCount(episodes) {
    episodeCountText.textContent = `Got ${episodes.length} episode(s)`;
  }

  episodeSelector.addEventListener('change', (event) => {
    const selectedEpisodeId = event.target.value;
    const selectedEpisode = episodeList.find(episode => episode.id.toString() === selectedEpisodeId);  // Fix here
    
    if (selectedEpisode) {
      renderEpisodes([selectedEpisode]);  // Render the selected episode
      episodeCountText.textContent = `Got 1 episode`;
    } else {
      renderEpisodes(episodeList);  // Render all episodes if nothing is selected
      updateEpisodeCount(episodeList);
    }
  });

  input.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filteredEpisodes = episodeList.filter((episode) => {
      const combinedContent = `${episode.name} ${episode.summary || ''}`.toLowerCase();
      return combinedContent.includes(searchTerm);
    });

    renderEpisodes(filteredEpisodes);
    populateSelector(filteredEpisodes);
    updateEpisodeCount(filteredEpisodes);
  });

  renderEpisodes(episodeList);
  populateSelector(episodeList);
  updateEpisodeCount(episodeList);
}

function showError(error) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = '';  // Clear existing content
  
  const errorMessage = document.createElement('p');
  errorMessage.textContent = `Sorry, there was an error loading the episodes: ${error.message}`;
  rootElem.appendChild(errorMessage);
}

window.onload = setup;

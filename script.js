function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  rootElem.textContent = '';

  rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const searchWrapper = document.createElement('div');
  searchWrapper.classList.add('search-wrapper');

  const form = document.createElement('form');

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'focus';
  input.required = true;
  input.classList.add('search-box');
  input.placeholder = 'Enter search term';

  const button = document.createElement('button');
  button.type = 'reset';
  button.classList.add('close-icon');

  form.appendChild(input);
  form.appendChild(button);
  searchWrapper.appendChild(form);

  rootElem.appendChild(searchWrapper);


  const episodeSelector = document.createElement('select');
  episodeSelector.classList.add('episode-selector');
  rootElem.appendChild(episodeSelector);

  const episodeContainer = document.createElement('div');
  episodeContainer.classList.add('episode-container');
  rootElem.appendChild(episodeContainer);

  function renderEpisodes(episodes) {
    episodeContainer.innerHTML = ''; 

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
        <img src="${episode.image.medium}" alt="${episode.name}" />
        <p><strong>Summary:</strong> ${episode.summary}</p>
        <p><a href="https://www.tvmaze.com/episodes/${episode.id}" target="_blank">More Info on TVMaze</a></p>
      `;

      episodeContainer.appendChild(episodeCard);
    });
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


  episodeSelector.addEventListener('change', (event) => {
    const selectedEpisodeId = event.target.value;
    if (selectedEpisodeId === '') {
  
      renderEpisodes(episodeList);
    } else {
      const selectedEpisode = episodeList.find((episode) => episode.id.toString() === selectedEpisodeId);
      renderEpisodes([selectedEpisode]);
    }
    rootElem.firstChild.textContent = `Got ${selectedEpisodeId === '' ? episodeList.length : 1} episode(s)`;
  });


  renderEpisodes(episodeList);
  populateSelector(episodeList);

  input.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();

    const filteredEpisodes = episodeList.filter((episode) => {
      const combinedContent = `${episode.name} ${episode.summary || ''}`.toLowerCase();
      return combinedContent.includes(searchTerm);
    });

    renderEpisodes(filteredEpisodes);
    populateSelector(filteredEpisodes);

    rootElem.firstChild.textContent = `Got ${filteredEpisodes.length} episode(s)`;
  });

  button.addEventListener('click', () => {
    input.value = '';
    renderEpisodes(episodeList);
    populateSelector(episodeList);
    rootElem.firstChild.textContent = `Got ${episodeList.length} episode(s)`;
  });
}

window.onload = setup;

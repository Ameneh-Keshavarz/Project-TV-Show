//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  
  rootElem.textContent = '';
  
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;

  const episodeContainer = document.createElement('div');
  episodeContainer.classList.add('episode-container');
  
  episodeList.forEach((episode) => {
    const episodeCard = document.createElement('div');
    episodeCard.classList.add('episode-card');

    const episodeCode = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')}`;

    // Constructing the episode content
    episodeCard.innerHTML = `
      <h2>${episode.name}</h2>
      <p><strong>Episode Code:</strong> ${episodeCode}</p>
      <p><strong>Season:</strong> ${episode.season}</p>
      <p><strong>Episode:</strong> ${episode.number}</p>
      <img src="${episode.image.medium}" alt="${episode.name}" />
      <p><strong>Summary:</strong> ${episode.summary}</p>
      <p><a href="https://www.tvmaze.com/episodes/${episode.id}" target="_blank">More Info on TVMaze</a></p>
    `;

    // Append the episode card to the container
    episodeContainer.appendChild(episodeCard);
  });

  // Append the episode container to the root element
  rootElem.appendChild(episodeContainer);
}

window.onload = setup;

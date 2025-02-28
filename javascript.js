// Global variables
let map;
let markers = [];
let movieData = [];
let currentInfoWindow = null; // Track the currently open info window

// Initialize the map
function initMap() {
  console.log("Map initialization started");

  // Center the map on San Francisco coordinates
  const sanFrancisco = { lat: 37.7749, lng: -122.4194 };

  // Create the map
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: sanFrancisco,
  });

  console.log("Map created");

  loadMovieData();
  setupSearch();
}

// Load movie data from data.json
async function loadMovieData() {
  try {
    console.log("Loading movie data");
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load movie data');

    movieData = await response.json();
    console.log(`Loaded ${movieData.length} movie entries`);
    addMarkersToMap(movieData);

  } catch (error) {
    console.error('Error loading movie data:', error);
    alert('Failed to load movie data. Please try again later.');
  }
}

// Add markers to the map
function addMarkersToMap(movies) {
  clearMarkers(); // Clear existing markers

  movies.forEach(movie => {
    if (movie.location && movie.lat && movie.lng) {
      const position = { lat: parseFloat(movie.lat), lng: parseFloat(movie.lng) };
      console.log(`Adding marker for: ${movie.title} at (${position.lat}, ${position.lng})`);

      // Create the marker
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: movie.title,
      });

      // Info window content (styled with Bootstrap classes)
      const infoContent = `
        <div class="info-window">
          <h5>${movie.title}</h5>
          <p><strong>Year:</strong> ${movie.release_year || 'N/A'}</p>
          <p><strong>Location:</strong> ${movie.location || 'N/A'}</p>
          <p><strong>Director:</strong> ${movie.director || 'N/A'}</p>
          <p><strong>Cast:</strong> ${[movie.actor_1, movie.actor_2, movie.actor_3].filter(Boolean).join(', ') || 'N/A'}</p>
        </div>
      `;

      // Create the info window
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent,
      });

      // Hover event to open info window
      marker.addListener('mouseover', () => {
        if (currentInfoWindow) currentInfoWindow.close(); // Close the previous info window
        infoWindow.open(map, marker);
        currentInfoWindow = infoWindow; // Update the currently open info window
      });

      // Hover out event to close info window
      marker.addListener('mouseout', () => {
        infoWindow.close();
        currentInfoWindow = null; // Reset the currently open info window
      });

      // Click event to center the map on the marker
      marker.addListener('click', () => {
        map.setCenter(marker.getPosition());
        map.setZoom(14);
      });

      markers.push(marker); // Store marker reference
    } else {
      console.warn(`Skipping invalid movie data: ${movie.title}`);
    }
  });
}

// Clear all markers
// function clearMarkers() {
//   markers.forEach(marker => marker.setMap(null));
//   markers = [];
// }

// Set up search functionality
function setupSearch() {
  const searchInput = document.getElementById('search');
  const autocompleteList = document.createElement('div');
  autocompleteList.className = 'autocomplete-items';
  searchInput.parentNode.appendChild(autocompleteList);

  // Add input event listener for search
  searchInput.addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    autocompleteList.innerHTML = '';

    if (searchText === '') {
      addMarkersToMap(movieData);
      autocompleteList.style.display = 'none';
      return;
    }

    const matchedMovies = movieData.filter(movie => 
      movie.title && movie.title.toLowerCase().includes(searchText)
    );
    const uniqueTitles = [...new Set(matchedMovies.map(movie => movie.title))];

    if (uniqueTitles.length > 0) {
      autocompleteList.style.display = 'block';
      uniqueTitles.slice(0, 5).forEach(title => {
        const item = document.createElement('div');
        item.textContent = title;
        item.addEventListener('click', () => {
          searchInput.value = title;
          const selectedMovies = movieData.filter(movie => movie.title === title);
          addMarkersToMap(selectedMovies);
          if (selectedMovies.length > 0 && selectedMovies[0].lat && selectedMovies[0].lng) {
            map.setCenter({ lat: parseFloat(selectedMovies[0].lat), lng: parseFloat(selectedMovies[0].lng) });
            map.setZoom(14);
          }
          autocompleteList.style.display = 'none';
        });
        autocompleteList.appendChild(item);
      });
    } else {
      autocompleteList.style.display = 'none';
    }

    addMarkersToMap(matchedMovies);
  });

  // Hide autocomplete when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (e.target !== searchInput) autocompleteList.style.display = 'none';
  });
}
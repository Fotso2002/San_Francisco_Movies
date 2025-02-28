// Global variables
let map;
let markers = [];
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

  // Load movie data from the JSON file
  loadMovieData();
}

// Load movie data from data.json
async function loadMovieData() {
  try {
    console.log("Loading movie data");
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load movie data');

    const movieData = await response.json();
    console.log(`Loaded ${movieData.length} movie entries`);
    addMarkersToMap(movieData);

  } catch (error) {
    console.error('Error loading movie data:', error);
    alert('Failed to load movie data. Please try again later.');
  }
}

function addMarkersToMap(movies) {
    clearMarkers(); // Clear old markers
  
    movies.forEach(movie => {
        const lat = parseFloat(movie.lat);
        const lng = parseFloat(movie.lng);
      
        if (!isNaN(lat) && !isNaN(lng)) {
            const position = { lat, lng };
            console.log(`Adding marker for: ${movie.title} at (${lat}, ${lng})`);
            
            const marker = new google.maps.Marker({
                position: position,
                map: map, // Ensure map is valid
                title: movie.title,
            });

            // Create info window content
            const infoContent = `
                <div class="info-window">
                    <h5>${movie.title}</h5>
                    <p><strong>Year:</strong> ${movie.release_year || 'N/A'}</p>
                    <p><strong>Location:</strong> ${movie.location || 'N/A'}</p>
                    <p><strong>Director:</strong> ${movie.director || 'N/A'}</p>
                    <p><strong>Cast:</strong> ${[movie.actor_1, movie.actor_2, movie.actor_3].filter(Boolean).join(', ') || 'N/A'}</p>
                </div>
            `;

            const infoWindow = new google.maps.InfoWindow({ content: infoContent });

            // Click to open info window
            marker.addListener("click", () => {
                if (currentInfoWindow) currentInfoWindow.close(); // Close previous
                infoWindow.open(map, marker);
                currentInfoWindow = infoWindow; // Store reference
            });

            markers.push(marker);
        } else {
            console.warn(`Skipping movie: ${movie.title} (Invalid coordinates)`);
        }
    });
}

// Function to clear existing markers
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}


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
// Global variables
let map;
let markers = [];
let currentInfoWindow = null;

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
      
      addMarkersToMap(movieData); // Display markers
      setupSearch(movieData); // Call the search setup with movie data
  
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
                map: map,
                title: movie.title,
            });

            // Create info window content
            const infoContent = `
                <div class="info-window">
                    <h5>${movie.title}</h5>
                    <p><strong>Year:</strong> ${movie.release_year || 'N/A'}</p>
                    <p><strong>Writer:</strong> ${movie.writer || 'N/A'}</p>
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


function setupSearch(movieData) {
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('searchButton'); // Ensure this exists in HTML
    const autocompleteList = document.createElement('div');
    autocompleteList.className = 'autocomplete-items';
    searchInput.parentNode.appendChild(autocompleteList);
  
    // Function to perform search
    const performSearch = () => {
      const searchText = searchInput.value.trim().toLowerCase(); // Get search text
      autocompleteList.innerHTML = ''; // Clear previous autocomplete results
  
      // If search field is empty, show all markers and hide autocomplete
      if (!searchText) {
        addMarkersToMap(movieData); // Show all markers
        autocompleteList.style.display = 'none'; // Hide autocomplete
        return;
      }
  
      // Filter movies based on search text
      const matchedMovies = movieData.filter(movie => 
        movie.title && movie.title.toLowerCase().includes(searchText)
      );
  
      // If no matches, hide autocomplete
      if (matchedMovies.length === 0) {
        autocompleteList.style.display = 'none';
        return;
      }
  
      // Show up to 5 unique movie titles in autocomplete
      matchedMovies.slice(0, 5).forEach(movie => {
        const item = document.createElement('div');
        item.textContent = movie.title;
        item.classList.add('autocomplete-item');
  
        // Add click event to select a movie
        item.addEventListener('click', () => {
          searchInput.value = movie.title; // Update search input with selected title
          addMarkersToMap([movie]); // Show only the selected movie's marker
  
          // Center the map on the selected movie's location
          if (movie.lat && movie.lng) {
            map.setCenter({ lat: parseFloat(movie.lat), lng: parseFloat(movie.lng) });
            map.setZoom(14); // Zoom in for better visibility
          }
  
          autocompleteList.style.display = 'none'; // Hide autocomplete after selection
        });
  
        autocompleteList.appendChild(item); // Add item to autocomplete list
      });
  
      autocompleteList.style.display = 'block'; // Show autocomplete list
    };
  
    // Add input event listener for search
    searchInput.addEventListener('input', performSearch);
  
    // Add click event listener for search button
    if (searchButton) {  // Ensure the button exists before adding event listener
        searchButton.addEventListener('click', () => {
            performSearch(); // Perform search when button is clicked
        });
    } else {
        console.error("Search button not found! Check your HTML.");
    }
  
    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
        autocompleteList.style.display = 'none'; // Hide autocomplete
      }
    });
}

  
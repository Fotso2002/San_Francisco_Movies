// Global variables
let map;
let markers = [];
let movieData = [];
let autocompleteList = document.createElement('div');

// Initialize the map - This function will be called by the Google Maps API
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
    if (!response.ok) {
      throw new Error('Failed to load movie data');
    }
    
    movieData = await response.json();
    console.log(`Loaded ${movieData.length} movie entries`);
    addMarkersToMap(movieData);
    
  } catch (error) {
    console.error('Error loading movie data:', error);
    alert('Failed to load movie data. Please try again later.');
  }
}

function addMarkersToMap(movies) {
  clearMarkers();
  movies.forEach(movie => {
    // Check if the movie has valid location data
    if (movie.location && movie.lat && movie.lng) {
      const position = {
        lat: parseFloat(movie.lat),
        lng: parseFloat(movie.lng)
      };
      
      // Create a marker
      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: movie.title
      });
      
      // Add info window with movie details
      const infoContent = `
        <div class="info-window">
          <h5>${movie.title}</h5>
          <p><strong>Year:</strong> ${movie.release_year || 'N/A'}</p>
          <p><strong>Location:</strong> ${movie.location || 'N/A'}</p>
          <p><strong>Director:</strong> ${movie.director || 'N/A'}</p>
          <p><strong>Distribution:</strong> ${movie.distribution || 'N/A'}</p>
          <p><strong>Production:</strong> ${movie.production_company || 'N/A'}</p>
          <p><strong>Writer:</strong> ${movie.writer || 'N/A'}</p>
          <p><strong>Cast:</strong> ${movie.actor_1 || 'N/A'}${movie.actor_2 ? ', ' + movie.actor_2 : ''}${movie.actor_3 ? ', ' + movie.actor_3 : ''}</p>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({
        content: infoContent
      });
      
      // Add click event to show info window
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
      
      // Store marker reference
      markers.push(marker);
    }
  });
}

// Clear all markers from the map
function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

// Set up search functionality with autocomplete
function setupSearch() {
  const searchInput = document.getElementById('search');
  
  // Create and style autocomplete container
  autocompleteList.className = 'autocomplete-items';
  searchInput.parentNode.appendChild(autocompleteList);
  
  // Add input event listener for search
  searchInput.addEventListener('input', function() {
    const searchText = this.value.toLowerCase();
    
    // Clear previous autocomplete results
    autocompleteList.innerHTML = '';
    
    // If search field is empty, show all markers
    if (searchText === '') {
      addMarkersToMap(movieData);
      autocompleteList.style.display = 'none';
      return;
    }
    
    // Filter movies based on search text
    const matchedMovies = movieData.filter(movie => 
      movie.title && movie.title.toLowerCase().includes(searchText)
    );
    
    // Get unique movie titles for autocomplete
    const uniqueTitles = [...new Set(matchedMovies.map(movie => movie.title))];
    
    // Display autocomplete suggestions
    if (uniqueTitles.length > 0) {
      autocompleteList.style.display = 'block';
      
      // Limit to first 5 suggestions for better UX
      uniqueTitles.slice(0, 5).forEach(title => {
        const item = document.createElement('div');
        item.innerHTML = title;
        item.addEventListener('click', function() {
          searchInput.value = title;
          
          // Filter markers to show only the selected movie
          const selectedMovies = movieData.filter(movie => 
            movie.title === title
          );
          
          addMarkersToMap(selectedMovies);
          
          // Center map on first result
          if (selectedMovies.length > 0 && selectedMovies[0].lat && selectedMovies[0].lng) {
            map.setCenter({
              lat: parseFloat(selectedMovies[0].lat),
              lng: parseFloat(selectedMovies[0].lng)
            });
            map.setZoom(14);
          }
          
          // Hide autocomplete list
          autocompleteList.style.display = 'none';
        });
        autocompleteList.appendChild(item);
      });
    } else {
      autocompleteList.style.display = 'none';
    }
    
    // Update markers on map
    addMarkersToMap(matchedMovies);
  });
  
  // Hide autocomplete when clicking elsewhere
  document.addEventListener('click', function(e) {
    if (e.target !== searchInput) {
      autocompleteList.style.display = 'none';
    }
  });
}
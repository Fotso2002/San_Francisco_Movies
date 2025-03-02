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
    const searchButton = document.getElementById('searchButton'); 
    const autocompleteList = document.createElement('div');
    autocompleteList.className = 'autocomplete-items';
    searchInput.parentNode.appendChild(autocompleteList);

    if (!searchInput || !searchButton) {
        console.error("Search input or button not found! Check your HTML.");
        return;
    }

    // Function to perform search
    const performSearch = () => {
        const searchText = searchInput.value.trim().toLowerCase(); 
        console.log("Search text:", searchText); // Debugging log

        autocompleteList.innerHTML = ''; // Clear previous autocomplete results

        if (!searchText) {
            console.log("Search is empty, showing all markers.");
            addMarkersToMap(movieData); // Show all markers
            autocompleteList.style.display = 'none'; 
            return;
        }

        // Filter movies based on search text
        const matchedMovies = movieData.filter(movie => 
            movie.title && movie.title.toLowerCase().includes(searchText)
        );
        console.log("Matched movies:", matchedMovies); // Debugging log

        if (matchedMovies.length === 0) {
            console.log("No matching movies found.");
            autocompleteList.style.display = 'none';
            alert("No movies found with that title.");
            return;
        }

        console.log("Updating map with matched movies.");
        addMarkersToMap(matchedMovies); // Show all matched movies

        // Display autocomplete list with unique titles
        const uniqueTitles = [...new Set(matchedMovies.map(m => m.title))]; // Remove duplicate titles
        autocompleteList.innerHTML = ''; 
        uniqueTitles.slice(0, 5).forEach(title => {
            const item = document.createElement('div');
            item.textContent = title;
            item.classList.add('autocomplete-item');

            item.addEventListener('click', () => {
                searchInput.value = title; 

                // Filter movies again for selected title (to get all locations)
                const selectedMovies = movieData.filter(m => m.title.toLowerCase() === title.toLowerCase());
                console.log("Selected movie locations:", selectedMovies);
                addMarkersToMap(selectedMovies); // Show all markers for this title

                // Adjust map to fit all locations
                const bounds = new google.maps.LatLngBounds();
                selectedMovies.forEach(m => bounds.extend(new google.maps.LatLng(m.lat, m.lng)));
                map.fitBounds(bounds);

                autocompleteList.style.display = 'none'; 
            });

            autocompleteList.appendChild(item);
        });

        autocompleteList.style.display = 'block'; 
    };

    // Input event for live search
    searchInput.addEventListener('input', performSearch);

    // Search button click event
    searchButton.addEventListener('click', () => {
        console.log("Search button clicked! Performing search.");
        performSearch(); 
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.style.display = 'none'; 
        }
    });
}




  
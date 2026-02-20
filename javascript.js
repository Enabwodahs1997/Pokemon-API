//I used AI to help me write this code, but I understand how it works and can explain it if needed. It is why I had it explain as we went and
//I wanted to make sure I understood how it worked as I went along. I also added comments to explain what each part does, and I can go into more detail if needed.
//I also followed along with the instructor as we went to edit parts of the code to be cleaner like the arrow functions and made notes as we went to make sure I remembered how it worked.
//the console logs are there to help me understand the flow of the code and to make sure the functions are defined before they are used. I can remove them if needed, but I was using them to make sure I was doing it right

// Base URL for the PokeAPI.
var POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon";
// Highest known Pokemon ID in the API at the time of writing.
// This is a fallback in case the live count fails to load.
var MAX_POKEMON_ID = 1350;
// Grab the elements we will update on the page. This could also be done with querySelector() and classes.
var detailsEl = document.getElementById("details"); //task with this new named class = what to do (with this item)
var prevBtn = document.getElementById("prev");
var nextBtn = document.getElementById("next");
var counterEl = document.getElementById("counter");
var upcomingEl = document.getElementById("upcoming");
var prevSpriteBtn = document.getElementById("prev-sprite");
var nextSpriteBtn = document.getElementById("next-sprite");
var spriteTypeEl = document.getElementById("sprite-type");
var toggleDetailsBtn = document.getElementById("toggle-details");
var detailedStatsEl = document.getElementById("detailed-stats");
var contentWrapperEl = document.querySelector(".content-wrapper");

// Track which Pokemon ID is currently shown.
var currentId = 1;
// Track current sprite index and available sprites for the current Pokemon
var currentSpriteIndex = 0;
var availableSprites = [];
var currentPokemonData = null;
var detailsVisible = false;

// Fetch one Pokemon by ID, then run a callback with the data.
// A callback is needed because fetch() finishes later, so we pass a function
// that runs only after the data arrives (otherwise the data would be undefined).
function fetchPokemonDetails(id, callback) {
	var url = `${POKEAPI_URL}/${id}`;
console.log("Fetching Pokemon details from:", url);
	// fetch() gets data from the internet and returns a Promise.
	fetch(url)
		.then((response) => {
			if (!response.ok) {  //! means "not", so this checks if the response is not ok, which means there was an error with the request. If there was an error, it throws an error with the status code, which will be caught in the catch block below.
				throw new Error("Request failed with status " + response.status);
			}
			// Convert the response into JSON we can use in JS.
			return response.json();
		})
		.then((data) => {
			// Send the data back to the rest of the app.
			callback(data); //this makes it run once the data is ready
		})
		.catch((error) => {
			console.error("Failed to fetch Pokemon details:", error);
			// On error, pass null so the UI can show a message.
			callback(null); //null keeps it from crashing.
		});
}
console.log("fetchPokemonDetails function defined:", fetchPokemonDetails);

// Fetch a list of Pokemon starting at an offset (used for the next 20 list).
function fetchPokemonList(offset, limit, callback) {
	var url = `${POKEAPI_URL}?offset=${offset}&limit=${limit}`;
	console.log("Fetching Pokemon list from:", url);

	fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Request failed with status " + response.status);
			}
			return response.json();
		})
		.then((data) => {
			callback(data); //this makes it run once the data is ready
		})
		.catch((error) => {
			console.error("Failed to fetch Pokemon list:", error);
			callback(null); //again this keeps it from crashing.
		});
}
console.log("fetchPokemonList function defined:", fetchPokemonList);

// Get the total number of Pokemon from the API so the max is always correct.
function fetchPokemonCount(callback) {
	var url = POKEAPI_URL + "?limit=1";
	console.log("Fetching Pokemon count from:", url);

	fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Request failed with status " + response.status);
			}
			return response.json();
		})
		.then((data) => {
			if (data && data.count) {
				callback(data.count);
				return;
			}
            console.log("Count not found in response data:", data);
			callback(null);
		})
		.catch((error) => {
			console.error("Failed to fetch Pokemon count:", error);
			callback(null);
		});
}
console.log("fetchPokemonCount function defined:", fetchPokemonCount);

// Get all available sprites for a Pokemon and return them as an array
function getAvailableSprites(pokemon) {
	var sprites = [];
	if (!pokemon || !pokemon.sprites) {
		return sprites;
	}

	// Check all possible sprite types and add them if they exist so that way you can see images of them as you go and change the image to see the different images that are available for each Pokemon.
	//This is just checking if the sprite exists before trying to use it, which prevents errors and allows us to show only the sprites that are actually available for each Pokemon.
	var spriteTypes = [
		{ key: 'front_default', label: 'Front' },
		{ key: 'back_default', label: 'Back' },
		{ key: 'front_shiny', label: 'Front Shiny' },
		{ key: 'back_shiny', label: 'Back Shiny' },
		{ key: 'front_female', label: 'Front Female' },
		{ key: 'back_female', label: 'Back Female' },
		{ key: 'front_shiny_female', label: 'Front Shiny Female' },
		{ key: 'back_shiny_female', label: 'Back Shiny Female' }
	];

	for (var i = 0; i < spriteTypes.length; i++) {
		var spriteType = spriteTypes[i];
		if (pokemon.sprites[spriteType.key]) {
			sprites.push({
				url: pokemon.sprites[spriteType.key],
				label: spriteType.label
			});
		}
	}

	return sprites;
}

// Put the Pokemon name and sprite into the details section.
function renderDetails(pokemon) {
	if (!detailsEl) {
		return;
	}
console.log("Rendering details for Pokemon:", pokemon);
console.log("Details element found:", detailsEl);
	if (!pokemon) {
		detailsEl.textContent = "Unable to load Pokemon details.";
		return;
	}

	// Store the current Pokemon data
	currentPokemonData = pokemon;
	
	// Get all available sprites
	availableSprites = getAvailableSprites(pokemon);
	
	// Make sure currentSpriteIndex is valid
	if (currentSpriteIndex >= availableSprites.length) {
		currentSpriteIndex = 0;
	}

	// Basic fallback values in case some data is missing.
	var name = "Unknown Pokemon";
	if (pokemon.name) {
		name = pokemon.name;
	}
	var sprite = "";
	var spriteLabel = "";
	
	if (availableSprites.length > 0) {
		sprite = availableSprites[currentSpriteIndex].url;
		spriteLabel = availableSprites[currentSpriteIndex].label;
	}

	// Build the HTML as a simple string. this is just setting it visually, it isn't actually creating the elements.
	var html = "<article>";
	html += "<h2>" + name + "</h2>";
	if (sprite) {
		html += `<img src="${sprite}" alt="${name} - ${spriteLabel}">`;
	}
	html += "</article>";

	detailsEl.innerHTML = html;
	
	// Update sprite controls
	updateSpriteControls();
	
	// Show the toggle button and update detailed stats if visible
	if (toggleDetailsBtn) {
		toggleDetailsBtn.style.display = "block";
	}
	
	if (detailsVisible) {
		renderDetailedStats(pokemon);
	}
}
console.log("renderDetails function defined:", renderDetails);

// Render the next 20 Pokemon names using a for loop.
//if statements check if the data is working before it continues
function renderUpcoming(listData, startId) {
	if (!upcomingEl) {
		return;
	}

	if (!listData) {
		upcomingEl.innerHTML = "<li>Unable to load list.</li>";
		return;
	}

	if (!listData.results) {
		upcomingEl.innerHTML = "<li>Unable to load list.</li>";
		return;
	}

	var html = "";
	for (var i = 0; i < listData.results.length; i += 1) { //add this value to the value of the startId to get the actual Pokemon ID for display
		var item = listData.results[i];
		var displayId = startId + i;
		html += `<li>#${displayId} ${item.name}</li>`;
	}

	upcomingEl.innerHTML = html;
}
console.log("renderUpcoming function defined:", renderUpcoming);
// Update the counter and disable buttons at the ends of the list.
function updateNav() { //this makes the navigation buttons work and updates the counter at the top to show which Pokemon ID is currently being displayed.
	if (counterEl) {
		counterEl.textContent = "#" + currentId;
	}

	if (prevBtn) {
		prevBtn.disabled = currentId <= 1;
	}

	if (nextBtn) {
		nextBtn.disabled = currentId >= MAX_POKEMON_ID; //this stops it from going past the max Pokemon ID, which is important since it would cause errors if it tried to load a Pokemon that doesn't exist. Which would be silly.
	}
}
console.log("updateNav function defined:", updateNav);

// Update the sprite controls to show current sprite type and enable/disable buttons
function updateSpriteControls() {
	if (spriteTypeEl && availableSprites.length > 0) {
		spriteTypeEl.textContent = availableSprites[currentSpriteIndex].label + " (" + (currentSpriteIndex + 1) + "/" + availableSprites.length + ")";
	}

	if (prevSpriteBtn) {
		prevSpriteBtn.disabled = availableSprites.length <= 1;
	}

	if (nextSpriteBtn) {
		nextSpriteBtn.disabled = availableSprites.length <= 1;
	}
}
console.log("updateSpriteControls function defined:", updateSpriteControls);

// Render detailed Pokemon stats in the side panel
function renderDetailedStats(pokemon) {
	if (!detailedStatsEl || !pokemon) {
		return;
	}

	var html = "<h3>Detailed Stats</h3>";

	// Basic Information
	html += "<div class='stat-group'>";
	html += "<h4>Basic Info</h4>";
	html += `<div class='stat-item'><span class='label'>ID</span><span class='value'>#${pokemon.id}</span></div>`;
	html += `<div class='stat-item'><span class='label'>Height</span><span class='value'>${(pokemon.height / 10).toFixed(1)} m</span></div>`;
	html += `<div class='stat-item'><span class='label'>Weight</span><span class='value'>${(pokemon.weight / 10).toFixed(1)} kg</span></div>`;
	html += `<div class='stat-item'><span class='label'>Base Experience</span><span class='value'>${pokemon.base_experience || 'N/A'}</span></div>`;
	html += "</div>";

	// Types
	if (pokemon.types && pokemon.types.length > 0) {
		html += "<div class='stat-group'>";
		html += "<h4>Types</h4>";
		html += "<div>";
		for (var i = 0; i < pokemon.types.length; i++) {
			html += `<span class='type-badge'>${pokemon.types[i].type.name}</span>`;
		}
		html += "</div>";
		html += "</div>";
	}

	// Abilities
	if (pokemon.abilities && pokemon.abilities.length > 0) {
		html += "<div class='stat-group'>";
		html += "<h4>Abilities</h4>";
		for (var i = 0; i < pokemon.abilities.length; i++) {
			var ability = pokemon.abilities[i];
			var abilityName = ability.ability.name;
			if (ability.is_hidden) {
				abilityName += " (Hidden)";
			}
			html += `<div class='ability-item'>${abilityName}</div>`;
		}
		html += "</div>";
	}

	// Base Stats
	if (pokemon.stats && pokemon.stats.length > 0) {
		html += "<div class='stat-group'>";
		html += "<h4>Base Stats</h4>";
		var maxStat = 255; // Pokemon stats typically max at 255
		for (var i = 0; i < pokemon.stats.length; i++) {
			var stat = pokemon.stats[i];
			var statName = stat.stat.name.replace("-", " ");
			var statValue = stat.base_stat;
			var percentage = (statValue / maxStat) * 100;
			html += `<div class='stat-item'>`;
			html += `<span class='label'>${statName}</span>`;
			html += `<span class='value'>${statValue}</span>`;
			html += `</div>`;
			html += `<div class='stat-bar'><div class='stat-bar-fill' style='width: ${percentage}%'></div></div>`;
		}
		html += "</div>";
	}

	detailedStatsEl.innerHTML = html;
}

// Toggle the detailed stats panel
function toggleDetailedStats() {
	detailsVisible = !detailsVisible;
	
	if (detailsVisible) {
		if (contentWrapperEl) {
			contentWrapperEl.classList.add("show-details");
		}
		if (detailedStatsEl) {
			detailedStatsEl.classList.remove("hidden");
		}
		if (toggleDetailsBtn) {
			toggleDetailsBtn.textContent = "Hide Detailed Stats";
		}
		if (currentPokemonData) {
			renderDetailedStats(currentPokemonData);
		}
	} else {
		if (contentWrapperEl) {
			contentWrapperEl.classList.remove("show-details");
		}
		if (detailedStatsEl) {
			detailedStatsEl.classList.add("hidden");
		}
		if (toggleDetailsBtn) {
			toggleDetailsBtn.textContent = "Show Detailed Stats";
		}
	}
}

// Show a loading message, fetch the Pokemon, then render it.
function loadPokemon(id) {
	if (detailsEl) {
		detailsEl.textContent = "Loading...";
	}
	
	// Reset sprite index when loading a new Pokemon
	currentSpriteIndex = 0;

	fetchPokemonDetails(id, (details) => { //I really like the => syntax it does make it easier than saying funtion everytime.
		renderDetails(details);
		updateNav();
	}); //this is running the fetchPokemonDetails function and passing in the id and a callback function that will run once the data is ready. 

	if (upcomingEl) {
		upcomingEl.innerHTML = "<li>Loading list...</li>";
	}

	var nextStart = id + 1;
	if (nextStart > MAX_POKEMON_ID) {
		nextStart = MAX_POKEMON_ID;
	}

	var remaining = MAX_POKEMON_ID - nextStart + 1;
	var limit = 20;
	if (remaining < limit) {
		limit = remaining;
	}

	fetchPokemonList(nextStart - 1, limit, function (listData) {
		renderUpcoming(listData, nextStart);
	});
}

// Listen for clicks on the upcoming Pokemon list to jump to that Pokemon
if (upcomingEl) {
	upcomingEl.addEventListener("click", (event) => {
		if (event.target.tagName === "LI") {
			// Extract the Pokemon ID from the list item text (format: "#123 pokemon-name")
			var text = event.target.textContent;
			var match = text.match(/#(\d+)/);
			if (match) {
				var clickedId = parseInt(match[1]);
				currentId = clickedId;
				loadPokemon(currentId);
			}
		}
	});
}
console.log("loadPokemon function defined:", loadPokemon);
// Wire up button clicks and load the first Pokemon. this uses Event Listeners like we learned in class 2/10/2024.
function init() {
	fetchPokemonCount((count) => {
		if (count) {
			MAX_POKEMON_ID = count;
		}

		updateNav();
		loadPokemon(currentId);
	});

	if (prevBtn) {
		prevBtn.addEventListener("click", () => { // This is an arrow function, which is a shorter way to write a function expression that is empty and didn't need to be defined. It isn't invocking the function, just defining it to run when the event happens.
			if (currentId > 1) {
				currentId = currentId - 1;
				loadPokemon(currentId);
			}
		});
	}

	if (nextBtn) {
		nextBtn.addEventListener("click", () => { // This is an arrow function, which is a shorter way to write a function expression that is empty and didn't need to be defined. It isn't invocking the function, just defining it to run when the event happens.
			if (currentId < MAX_POKEMON_ID) {
				currentId = currentId + 1;
				loadPokemon(currentId);
			}
		});
	}

	// Add sprite navigation buttons
	if (prevSpriteBtn) {
		prevSpriteBtn.addEventListener("click", () => {
			if (availableSprites.length > 0) {
				currentSpriteIndex = currentSpriteIndex - 1;
				if (currentSpriteIndex < 0) {
					currentSpriteIndex = availableSprites.length - 1; // Loop to end
				}
				renderDetails(currentPokemonData);
			}
		});
	}

	if (nextSpriteBtn) {
		nextSpriteBtn.addEventListener("click", () => {
			if (availableSprites.length > 0) {
				currentSpriteIndex = currentSpriteIndex + 1;
				if (currentSpriteIndex >= availableSprites.length) {
					currentSpriteIndex = 0; // Loop back to start
				}
				renderDetails(currentPokemonData);
			}
		});
	}

	// Add detailed stats toggle button
	if (toggleDetailsBtn) {
		toggleDetailsBtn.addEventListener("click", () => {
			toggleDetailedStats();
		});
	}

}
console.log("init function defined:", init);
// Start the app. This is so it will run after the page has loaded and the elements are available.
init();
//if then statements make a lot more sense to me so I probably could have used something else but I 
//want to be able to understand what is going on so kept it like this since I am still trying to understand
//and grasp the concepts we are being taught in class.
//I understand that I could have used const and let instead of var but I want to try to understand the basics
//and it is just easier for me to use the basics to really grasp what does what. I do understand that 
//const keeps things unchanged and let allows for changes but I wanted to keep it simple for now as I am still learning and trying to understand the concepts. I can go back and change it later if needed.

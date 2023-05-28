const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchResultsContainer = document.getElementById(
  "searchResultsContainer"
);
const searchResultsDisplayContainer = document.getElementById(
  "searchResultsDisplayContainer"
); // Updated variable name for search results display container
const favouriteMealsContainer = document.getElementById(
  "favouriteMealsContainer"
); // Updated variable name for favorites meals container

let searchResults = [];
let favouriteMeals = [];

searchInput.addEventListener("keyup", () => {
  let searchTerm = searchInput.value.trim();
  if (searchTerm) {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        searchResultsContainer.innerHTML = "";
        if (data.meals) {
          data.meals.forEach((meal) => {
            const mealCard = `
              <div class="col-md-12 mb-1">
              <div class="row no-gutters">
              <div class="col-md-4">
                <img src="${meal.strMealThumb}" class="card-img" alt="${meal.strMeal}"  width="150" height="70">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${meal.strMeal}</h5>
                </div>
              </div>
            </div>
            </div>
            `;
            searchResultsContainer.insertAdjacentHTML("beforeend", mealCard);
          });
        } else {
          searchResultsContainer.innerHTML = "<p>No search results found.</p>";
        }
      })
      .catch((error) => console.error(error));
  } else {
    searchResultsContainer.innerHTML = "";
  }
});

// Add event listener to search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let searchTerm = searchInput.value.trim();
  if (searchTerm !== "") {
    // Call function to search meals
    searchMeals(searchTerm);
  }
});

// Function to search meals
function searchMeals(searchTerm) {
  // Clear search results container
  searchResultsDisplayContainer.innerHTML = "";

  // Call API to search meals
  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`)
    .then((response) => response.json())
    .then((data) => {
      // Update search results with API response
      searchResults = data.meals;
      // Call function to display search results
      displaySearchResults();
    })
    .catch((error) => console.error(error));
}

// Function to display search results
function displaySearchResults() {
  if (searchResults) {
    searchResults.forEach((meal) => {
      // Create meal card for search result
      const mealCard = document.createElement("div");
      // add bottom margin to meal card
      mealCard.classList.add("col-md-4", "meal-card", "mb-3", "p-1");
      mealCard.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
        <h5 class="mt-3">${meal.strMeal}</h5>
        <button class="btn btn-outline-primary btn-block mt-2" data-id="${meal.idMeal}">Add to Favourites</button>
        <button id="recipe" class="btn btn-outline-primary btn-block mt-2" data-id="${meal.idMeal}">View Recipe</button>
      `;

      // Add event listener to favourite button
      const favouriteBtn = mealCard.querySelector(".btn");
      favouriteBtn.addEventListener("click", (e) => {
        const mealId = e.target.dataset.id;
        // Call function to add meal to favourites
        addMealToFavourites(mealId);
      });

      // Add event listener to recipe button
      const recipeBtn = mealCard.querySelector("#recipe");
      recipeBtn.addEventListener("click", (e) => {
        const mealId = e.target.dataset.id;
        // Call function to view recipe
        viewRecipe(mealId);
      });

      // Append meal card to search results container
      searchResultsDisplayContainer.appendChild(mealCard);
    });
  } else {
    // Display message if no search results
    searchResultsContainer.innerHTML = `<p>No meals found. Please try again.</p>`;
  }
}

function viewRecipe(mealId) {
  // Call API to get recipe
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then((response) => response.json())
    .then((data) => {
      // Update search results with API response
      const meal = data.meals[0];
      // Call function to display recipe
      console.log(meal);
      getMealDetails(meal);
    })
    .catch((error) => console.error(error));
}

// Function to add meal to favourites
function addMealToFavourites(mealId) {
  // Check if meal already exists in favourites
  const existingMeal = favouriteMeals.find((meal) => meal.idMeal === mealId);
  if (!existingMeal) {
    // Find meal from search results
    const meal = searchResults.find((meal) => meal.idMeal === mealId);
    if (meal) {
      // Add meal to favourites
      favouriteMeals.push(meal);
      // Call function to update favourites UI
      updateFavouritesUI();
    }
  }
}

// Function to update favourites UI
function updateFavouritesUI() {
  // Clear favourites meals container
  favouriteMealsContainer.innerHTML = "";

  if (favouriteMeals.length > 0) {
    // Create a new row div element
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    favouriteMeals.forEach((meal) => {
      // Create meal card for favourite meal
      const mealCard = document.createElement("div");

      mealCard.classList.add("col-md-4", "meal-card", "mb-3", "p-1");
      mealCard.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="img-fluid">
        <h5 class="mt-3">${meal.strMeal}</h5>
        <button class="btn btn-outline-danger btn-block mt-2" data-id="${meal.idMeal}">Remove</button>
      `;

      // Add event listener to favourite button
      const favouriteBtn = mealCard.querySelector(".btn");
      favouriteBtn.addEventListener("click", (e) => {
        const mealId = e.target.dataset.id;
        // Call function to remove meal from favourites
        removeMealFromFavourites(mealId);
      });

      // Append meal card to favourites meals container
      rowDiv.appendChild(mealCard);
    });

    // Append row div to favourites meals container
    favouriteMealsContainer.appendChild(rowDiv);
    favouriteMealsContainer.classList.add("col-md-12");
  } else {
    // Display message if no favourite meals
    favouriteMealsContainer.innerHTML = `<p>No favourite meals. Click on the "Add to Favourites" button to add meals to your favourites.</p>`;
  }

  // Call function to update favourites count
  updateFavouritesCount();

  // Call function to update favourites in local storage
  updateFavouritesInLocalStorage();
}

// Function to update favourites count
function updateFavouritesCount() {
  // Update favourites count
  const favouritesCount = document.getElementById("favouritesCount");
  // check if favouritesCount is not null
  if (favouritesCount) favouritesCount.innerText = favouriteMeals.length;
}

// Function to update favourites in local storage
function updateFavouritesInLocalStorage() {
  // Save favourites to local storage
  localStorage.setItem("favouriteMeals", JSON.stringify(favouriteMeals));
}

// Call function to get favourites from local storage on page load
getFavouritesFromLocalStorage();

// Function to get favourites from local storage
function getFavouritesFromLocalStorage() {
  // Get favourites from local storage
  const meals = JSON.parse(localStorage.getItem("favouriteMeals"));
  if (meals) {
    // Update favourites with local storage data
    favouriteMeals = meals;
    // Call function to update favourites UI
    updateFavouritesUI();
  }
}

// Function to remove meal from favourites
function removeMealFromFavourites(mealId) {
  // Find index of meal to remove
  const mealIndex = favouriteMeals.findIndex((meal) => meal.idMeal === mealId);
  if (mealIndex !== -1) {
    // Remove meal from favourites
    favouriteMeals.splice(mealIndex, 1);
    // Call function to update favourites UI
    updateFavouritesUI();
  }
}

// Call function to update favourites UI on page load
updateFavouritesUI();

function getMealDetails(meal) {
  console.log(meal);
  // Set the modal title
  document.getElementById("mealModalTitle").innerText = meal.strMeal;
  // Set the modal image
  document
    .getElementById("mealModalImg")
    .setAttribute("src", meal.strMealThumb);
  // Set the modal category
  document.getElementById("mealModalCategory").innerText = meal.strCategory;
  // Set the modal area
  document.getElementById("mealModalArea").innerText = meal.strArea;
  // Set the modal ingredients
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`
      );
    } else {
      break;
    }
  }
  document.getElementById("mealModalIngredients").innerHTML = ingredients
    .map((ingredient) => `<li>${ingredient}</li>`)
    .join("");
  // Set the modal instructions
  document.getElementById("mealModalInstructions").innerText =
    meal.strInstructions;

  // Set the YouTube video link
  const youtubeLink = `https://www.youtube.com/watch?v=${meal.strYoutube.slice(-11)}`;
  const youtubeIcon = document.createElement('a');
  youtubeIcon.href = youtubeLink;
  youtubeIcon.target = '_blank';
  youtubeIcon.classList.add('youtube-icon');
  youtubeIcon.innerHTML = '<i class="fab fa-youtube"></i>';
  const modalHeader = document.querySelector('.modal-header');
  modalHeader.insertBefore(youtubeIcon, modalHeader.firstChild);

  // Show the modal
  $("#mealModal").modal("show");
}

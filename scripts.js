import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// Populates page with book preview button elements
const starting = document.createDocumentFragment();

for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

  starting.appendChild(element);
}

document.querySelector("[data-list-items]").appendChild(starting);

// Populates the search and filter fields
const genreHtml = document.createDocumentFragment();
const firstGenreElement = document.createElement("option");
firstGenreElement.value = "any";
firstGenreElement.innerText = "All Genres";
genreHtml.appendChild(firstGenreElement);

for (const [id, name] of Object.entries(genres)) {
  const element = document.createElement("option");
  element.value = id;
  element.innerText = name;
  genreHtml.appendChild(element);
}

document.querySelector("[data-search-genres]").appendChild(genreHtml);

const authorsHtml = document.createDocumentFragment();
const firstAuthorElement = document.createElement("option");
firstAuthorElement.value = "any";
firstAuthorElement.innerText = "All Authors";
authorsHtml.appendChild(firstAuthorElement);

for (const [id, name] of Object.entries(authors)) {
  const element = document.createElement("option");
  element.value = id;
  element.innerText = name;
  authorsHtml.appendChild(element);
}

document.querySelector("[data-search-authors]").appendChild(authorsHtml);

// Light & Dark mode handler
function setLightOrDarkMode(theme) {
  const colorConfig = theme === "night" 
    ? { dark: "255, 255, 255", light: "10, 10, 20" }
    : { dark: "10, 10, 20", light: "255, 255, 255" };

  document.documentElement.style.setProperty("--color-dark", colorConfig.dark);
  document.documentElement.style.setProperty("--color-light", colorConfig.light);
  document.querySelector("[data-settings-theme]").value = theme;
}

//
document.querySelector("[data-list-button]").innerText =
  `Show more (${books.length - BOOKS_PER_PAGE})`;
document.querySelector("[data-list-button]").disabled =
  matches.length - page * BOOKS_PER_PAGE > 0;

document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${matches.length - page * BOOKS_PER_PAGE > 0 ? matches.length - page * BOOKS_PER_PAGE : 0})</span>
`;

document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();

  for (const { author, id, image, title } of matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  )) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

    fragment.appendChild(element);
  }

  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
});

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    if (active) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText =
        `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  });

  // TODO
  // 1. Write init function to initialise page
  // 2. Write helper functions to be called within init function

  //Call helper functions within
  function init() {
    //Generate book button previews

    //Populate genre fields
    //Populate author fields

    //Check user preference and set light/dark mode with function

    setupEventListeners()
  }

function setupEventListeners() {
  document.querySelector("[data-search-cancel]").addEventListener("click", () => {
    document.querySelector("[data-search-overlay]").open = false;
  });

  document.querySelector("[data-settings-cancel]").addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });

  document.querySelector("[data-header-search]").addEventListener("click", () => {
    document.querySelector("[data-search-overlay]").open = true;
    document.querySelector("[data-search-title]").focus();
  });

  document.querySelector("[data-header-settings]").addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
  });

  document.querySelector("[data-list-close]").addEventListener("click", () => {
    document.querySelector("[data-list-active]").open = false;
  });

  document.querySelector("[data-settings-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    setLightOrDarkMode(theme);
    document.querySelector("[data-settings-overlay]").open = false;
  });

  document.querySelector("[data-search-form]").addEventListener("submit", (event) => {
    event.preventDefault();

    //Setup filters object to be used later to filter books via formdata (genre, author, title)
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);

    //Call helper function to filter books based on above filters from form
    matches = filterBooks(filters);
    page = 1;
    
    //Handle cases where there are no search results
    if (matches.length === 0) {
      document.querySelector("[data-list-message]").classList.add("list__message_show");
    } else {
      document.querySelector("[data-list-message]").classList.remove("list__message_show");
    }

    //Call helper function to display results, passing in filtered books
    displayBookSearchResults(matches)

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("[data-search-overlay]").open = false;
  });

  //Show more bookks when button clicked
  document.querySelector("[data-list-button]").addEventListener("click", () => {
    const fragment = document.createDocumentFragment();
    //Increment and extend page by the next page of books
    for (const book of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
      fragment.appendChild(createPreviewButton(book));
    }

    document.querySelector("[data-list-items]").appendChild(fragment);
    page += 1;

    //Disable the button when all books have been displayed
    document.querySelector("[data-list-button]").disabled = matches.length <= page * BOOKS_PER_PAGE;
  });


}

//This is an abstraction whereby this function can be called to handle when results need to be displayed when a user searches for specific books
function displayBookSearchResults(results) {
  const listItems = document.querySelector("[data-list-items]");
  listItems.innerHTML = ""; //Clearing the innerhtml in order to display the books from the search within

  //Create fragment to hold the resulting books within
  const fragment = document.createDocumentFragment();
  for (const book of results.slice(0, BOOKS_PER_PAGE)) {
    fragment.appendChild(createPreviewButton(book));
  }

  //Append the resulting books fragment to the previously cleared list
  listItems.appendChild(fragment);

  //Modify button according to the amount of remaining books - ie disable it if the results are less than one page
  document.querySelector("[data-list-button]").disabled = results.length <= BOOKS_PER_PAGE;
  document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${results.length > BOOKS_PER_PAGE ? results.length - BOOKS_PER_PAGE : 0})</span>
  `;
}

// Helper function to filter books based on search criteria, returns an array of filtered books by genre title and author
function filterBooks({genre, title, author}) {
  return books.filter(book => {
    const genreMatch = genre === "any" || book.genres.includes(genre);
    const titleMatch = !title.trim() || book.title.toLowerCase().includes(title.toLowerCase());
    const authorMatch = author === "any" || book.author === author;
    
    return genreMatch && titleMatch && authorMatch;
  });
}

init()

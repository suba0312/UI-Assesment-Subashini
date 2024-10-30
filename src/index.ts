interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

let currentPage = 0;
const itemsPerPage = 10;
let isButtonClicked = 0;
let displayedCount = 10; // Initial number of items to display
let products: any;
let searchedProducts = [];
let searchInputValue = '';
const productContainer = document.getElementById('product-list');
const searchInput = document.getElementById('search') as HTMLInputElement;
const loadMoreButton = document.getElementById(
  'load-more',
) as HTMLButtonElement;

async function onLoadMore() {
  isButtonClicked = 1;
  loadProducts();
}

// fetch products from API
async function fetchProducts(page: number, limit: number): Promise<Product[]> {
  showLoading(); // Show shimmer effect while loading
  const response = isButtonClicked
    ? await fetch(`https://fakestoreapi.com/products`)
    : await fetch(
        `https://fakestoreapi.com/products?limit=${limit}&page=${page + 1}`,
      );
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return await response.json();
}

async function loadProducts(): Promise<void> {
  try {
    products = await fetchProducts(currentPage, itemsPerPage);
    displayProducts(products);
    updateLoadMoreButtonVisibility();
    currentPage++;
  } catch (error) {
    console.error('Error fetching products:', error);
    showError(
      'Failed to load products. Please check your internet connection or try again later.',
    );
  }
}

// display the produts
function displayProducts(products: Product[]): void {
  if (productContainer) {
    productContainer.innerHTML = '';
    products.forEach((product) => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('product');

      productDiv.innerHTML = `
              <img src="${product.image}" alt="${product.title}">
              <h4 class="product-title">${product.title}</h4>
              <p class="product-price">$${product.price}</p>
          `;

      productContainer.appendChild(productDiv);
    });
  }
}

// Display error message
function showError(errorMessage: string) {
  hideLoading();
  if (!productContainer) return;
  productContainer.innerHTML = `
    <div class="error-message">
      <p>${errorMessage}</p>
    </div>
  `;
}

// Display a "No results" message
function showNoResultsMessage() {
  if (productContainer) {
    productContainer.innerHTML = `
    <div class="no-results-message">
      <p>No items match your search criteria. Try adjusting your filters or search term.</p>
    </div>
  `;
  }
}

function showLoading() {
  if (productContainer) {
    productContainer.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const shimmerCard = document.createElement('div');
      shimmerCard.className = 'shimmer-card';
      shimmerCard.innerHTML = `
      <div class="shimmer img"></div>
      <div class="shimmer title"></div>
      <div class="shimmer price"></div>
    `;
      productContainer.appendChild(shimmerCard);
    }
  }
}

// Hide shimmer loading placeholders
function hideLoading() {
  if (productContainer) {
    productContainer.innerHTML = '';
  }
}

// Function to apply filters
function applyFilters() {
  let filteredProducts = products;

  // Step 1: Filter by search query
  if (searchInputValue) {
    filteredProducts = filteredProducts.filter((product: any) =>
      product.title.toLowerCase().includes(searchInputValue),
    );
  }
  // Step 2: Filter by filter categories
  const checkedCategories = Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]:checked',
    ),
  ).map((checkBox) => checkBox.value);
  filteredProducts = filteredProducts.filter(
    (product: any) =>
      checkedCategories.length === 0 ||
      checkedCategories.includes(product.category),
  );
  // Step 3: Filter by sort options
  const sortValue = (document.getElementById('sortSelect') as HTMLSelectElement)
    .value;
  if (sortValue === 'priceAsc') {
    filteredProducts.sort(
      (a: { price: number }, b: { price: number }) => a.price - b.price,
    );
  } else if (sortValue === 'priceDesc') {
    filteredProducts.sort(
      (a: { price: number }, b: { price: number }) => b.price - a.price,
    );
  }
  // Step 4: display items or show error
  if (filteredProducts.length === 0) {
    showNoResultsMessage();
  } else {
    displayProducts(filteredProducts);
  }
}

// Function to update Load More button visibility
function updateLoadMoreButtonVisibility() {
  const filteredProducts = products.filter((product: any) =>
    product.title.toLowerCase().includes(searchInput.value.toLowerCase()),
  );

  loadMoreButton.disabled =
    searchInput.value.length > 0 || displayedCount < filteredProducts.length; // Disable if searching or all items are shown
}


//search functionality
searchInput?.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  searchInputValue = target.value.toLowerCase();
  applyFilters();
  updateLoadMoreButtonVisibility();
});

// Function to initialize the app
function init() {
  // Load initial products on page load
  loadProducts();

  // Event listeners for filters and sorting
  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', applyFilters);
  });

  document
    .getElementById('sortSelect')
    ?.addEventListener('change', applyFilters);

  
document.getElementById('load-more')?.addEventListener('click', onLoadMore);
}

// Initial setup
init();

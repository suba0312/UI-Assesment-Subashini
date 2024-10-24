interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

let currentPage = 0;
const itemsPerPage = 10;
let isButtonClicked = 0;
let products: any;

document.getElementById('load-more')?.addEventListener('click', onLoadMore);

async function onLoadMore() {
  isButtonClicked = 1;
  loadProducts();
}

// fetch products from API
async function fetchProducts(page: number, limit: number): Promise<Product[]> {
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
    currentPage++;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

// Function to apply filters
function applyFilters() {
  const checkedCategories = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'),
  ).map(checkBox => checkBox.value);
  let filteredProducts = products.filter(
    (product: any) =>
      checkedCategories.length === 0 ||
      checkedCategories.includes(product.category),
  );

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

  displayProducts(filteredProducts);
}

function displayProducts(products: Product[]): void {
  const productContainer = document.getElementById('product-list');
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
}

// Initial setup
init();

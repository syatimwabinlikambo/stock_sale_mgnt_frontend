let products = [];

let categories = [];

let editingProductId = null;

let deletingProductId = null;

let productModal = null;

let deleteProductModal = null;


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log("=================================");
        console.log("PRODUCT PAGE INITIALIZING");
        console.log("=================================");


        /*
         * Authentication
         */

        if (!Session.requireAuthentication()) {
            return;
        }


        /*
         * Render application layout
         */

        renderLayout();


        /*
         * Bootstrap modals
         */

        const productModalElement =
            document.getElementById(
                "productModal"
            );

        const deleteModalElement =
            document.getElementById(
                "deleteProductModal"
            );


        if (productModalElement) {

            productModal =
                new bootstrap.Modal(
                    productModalElement
                );

        }


        if (deleteModalElement) {

            deleteProductModal =
                new bootstrap.Modal(
                    deleteModalElement
                );

        }


        /*
         * Register form event
         */

        const productForm =
            document.getElementById(
                "productForm"
            );


        if (!productForm) {

            console.error(
                "productForm not found."
            );

            return;

        }


        productForm.addEventListener(
            "submit",
            handleProductSubmit
        );


        /*
         * Delete event
         */

        const confirmDeleteButton =
            document.getElementById(
                "confirmDeleteButton"
            );


        if (confirmDeleteButton) {

            confirmDeleteButton.addEventListener(
                "click",
                handleDeleteProduct
            );

        }


        /*
         * Load data
         */

        await loadCategories();

        await loadProducts();


        console.log(
            "PRODUCT PAGE READY"
        );

    }
);


/* ============================================================
   LOAD CATEGORIES
   ============================================================ */

async function loadCategories() {

    try {

        console.log(
            "Loading categories..."
        );


        const response =
            await API.get(
                "/product-categories"
            );


        console.log(
            "Categories status:",
            response.status
        );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(
                error ||
                "Unable to load categories."
            );

        }


        categories =
            await response.json();


        console.log(
            "Categories:",
            categories
        );


        populateCategories();


    } catch (error) {

        console.error(
            "CATEGORY ERROR:",
            error
        );

    }
}


/* ============================================================
   POPULATE CATEGORY SELECT
   ============================================================ */

function populateCategories() {

    const select =
        document.getElementById(
            "productCategory"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select category
        </option>
    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;

            option.textContent =
                formatCategory(category);


            select.appendChild(
                option
            );

        }
    );

}


/* ============================================================
   LOAD PRODUCTS
   ============================================================ */

async function loadProducts() {

    try {

        console.log(
            "Loading products..."
        );


        const response =
            await API.get(
                "/products"
            );


        console.log(
            "Products status:",
            response.status
        );


        if (response.status === 401) {

            showProductMessage(
                "Authentication required.",
                "danger"
            );

            return;

        }


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(
                error ||
                "Unable to load products."
            );

        }


        products =
            await response.json();


        console.log(
            "Products:",
            products
        );


        renderProducts();


    } catch (error) {

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );


        showProductMessage(
            error.message ||
            "Unable to load products.",
            "danger"
        );

    }
}


/* ============================================================
   RENDER PRODUCTS
   ============================================================ */

function renderProducts() {

    const container =
        document.getElementById(
            "pageContent"
        );


    if (!container) {

        console.warn(
            "pageContent not found."
        );

        return;

    }


    /*
     * Keep the existing application layout
     * and render product content.
     */

    container.innerHTML = `

        <div class="container-fluid">

            <div class="d-flex
                        justify-content-between
                        align-items-center
                        mb-4">

                <div>

                    <h2 class="mb-1">
                        Products
                    </h2>

                    <p class="text-muted mb-0">
                        Manage your products
                    </p>

                </div>


                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="openAddProductModal()">

                    <i class="bi bi-plus-circle"></i>

                    Add Product

                </button>

            </div>


            <div id="productMessage"></div>


            <div class="card shadow-sm">

                <div class="card-body">

                    <div class="table-responsive">

                        <table class="table table-hover align-middle">

                            <thead>

                                <tr>

                                    <th>ID</th>

                                    <th>Product</th>

                                    <th>Category</th>

                                    <th>Unit</th>

                                    <th>Purchase Price</th>

                                    <th>Selling Price</th>

                                    <th>Stock</th>

                                    <th>Alert Stock</th>

                                    <th>Actions</th>

                                </tr>

                            </thead>


                            <tbody id="productsTableBody">

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    `;


    const tbody =
        document.getElementById(
            "productsTableBody"
        );


    if (!tbody) {
        return;
    }


    if (!products.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="text-center text-muted py-4">

                    No products found.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        products.map(
            product => `

                <tr>

                    <td>
                        ${product.id ?? ""}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(
                                product.productName ?? ""
                            )}
                        </strong>
                    </td>

                    <td>
                        ${formatCategory(
                            product.productCategory
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            product.unit ?? ""
                        )}
                    </td>

                    <td>
                        ${product.purchasePrice ?? 0}
                    </td>

                    <td>
                        ${product.sellingPrice ?? 0}
                    </td>

                    <td>
                        <div class="d-flex align-items-center gap-2">

                            <span>
                                ${product.stock ?? 0}
                            </span>

                            ${getStockStatus(
                                product.stock,
                                product.alertStock
                            )}

                        </div>
                    </td>

                    <td>
                        ${product.alertStock ?? 0}
                    </td>

                    <td>

                        <button
                            class="btn btn-sm btn-outline-primary me-1"
                            onclick="openEditProductModal(${product.id})">

                            Edit

                        </button>


                        <button
                            class="btn btn-sm btn-outline-danger"
                            onclick="openDeleteProductModal(${product.id})">

                            Delete

                        </button>

                    </td>

                </tr>

            `
        ).join("");

}

function getStockStatus(stock, alertStock) {

    const currentStock =
        Number(stock ?? 0);

    const minimumStock =
        Number(alertStock ?? 0);


    if (currentStock < minimumStock) {

        return `
            <span class="badge bg-danger">
                Low Stock
            </span>
        `;

    }


    return "";

}

/* ============================================================
   ADD PRODUCT
   ============================================================ */

function openAddProductModal() {

    editingProductId = null;


    clearProductForm();


    document.getElementById(
        "productModalTitle"
    ).textContent =
        "Add Product";


    document.getElementById(
        "saveProductButton"
    ).textContent =
        "Save Product";


    clearFormAlert();


    productModal.show();

}


/* ============================================================
   EDIT PRODUCT
   ============================================================ */

function openEditProductModal(id) {

    const product =
        products.find(
            p => Number(p.id) === Number(id)
        );


    if (!product) {

        console.error(
            "Product not found:",
            id
        );

        return;

    }


    editingProductId =
        product.id;


    document.getElementById(
        "productModalTitle"
    ).textContent =
        "Edit Product";


    document.getElementById(
        "saveProductButton"
    ).textContent =
        "Update Product";


    document.getElementById(
        "productName"
    ).value =
        product.productName ?? "";


    document.getElementById(
        "productCategory"
    ).value =
        product.productCategory ?? "";


    document.getElementById(
        "unit"
    ).value =
        product.unit ?? "";


    document.getElementById(
        "purchasePrice"
    ).value =
        product.purchasePrice ?? "";


    document.getElementById(
        "sellingPrice"
    ).value =
        product.sellingPrice ?? "";


    document.getElementById(
        "stock"
    ).value =
        product.stock ?? "";


    document.getElementById(
        "alertStock"
    ).value =
        product.alertStock ?? 5;


    clearFormAlert();


    productModal.show();

}


/* ============================================================
   SAVE / UPDATE PRODUCT
   ============================================================ */

async function handleProductSubmit(event) {

    event.preventDefault();


    console.log(
        "================================="
    );

    console.log(
        "PRODUCT FORM SUBMITTED"
    );


    clearFormAlert();


    const productName =
        document.getElementById(
            "productName"
        ).value.trim();


    const productCategory =
        document.getElementById(
            "productCategory"
        ).value;


    const unit =
        document.getElementById(
            "unit"
        ).value.trim();


    const purchasePrice =
        Number(
            document.getElementById(
                "purchasePrice"
            ).value
        );


    const sellingPrice =
        Number(
            document.getElementById(
                "sellingPrice"
            ).value
        );


    const stock =
        Number(
            document.getElementById(
                "stock"
            ).value
        );


    const alertStock =
        Number(
            document.getElementById(
                "alertStock"
            ).value
        );


    const productData = {

        productName,

        productCategory,

        unit,

        purchasePrice,

        sellingPrice,

        stock,

        alertStock

    };


    console.log(
        "Product data:",
        productData
    );


    const button =
        document.getElementById(
            "saveProductButton"
        );


    button.disabled = true;


    try {

        let response;


        /*
         * UPDATE
         */

        if (
            editingProductId !== null
        ) {

            const endpoint =
                `/products/${editingProductId}`;


            console.log(
                "PUT:",
                endpoint
            );


            response =
                await API.put(
                    endpoint,
                    productData
                );

        }


        /*
         * CREATE
         */

        else {

            console.log(
                "POST:",
                "/products"
            );


            response =
                await API.post(
                    "/products",
                    productData
                );

        }


        console.log(
            "Backend response:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "Response body:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                responseText ||
                `Request failed with status ${response.status}`
            );

        }


        /*
         * Success
         */

        console.log(
            "PRODUCT SAVED SUCCESSFULLY"
        );


        productModal.hide();


        editingProductId = null;


        await loadProducts();


        showProductMessage(
            "Product saved successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "PRODUCT SAVE ERROR:",
            error
        );


        showFormAlert(
            error.message ||
            "Unable to save product.",
            "danger"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            editingProductId !== null
                ? "Update Product"
                : "Save Product";

    }

}


/* ============================================================
   DELETE
   ============================================================ */

function openDeleteProductModal(id) {

    const product =
        products.find(
            p => Number(p.id) === Number(id)
        );


    if (!product) {
        return;
    }


    deletingProductId =
        product.id;


    document.getElementById(
        "deleteProductName"
    ).textContent =
        product.productName;


    clearDeleteAlert();


    deleteProductModal.show();

}


async function handleDeleteProduct() {

    if (
        deletingProductId === null
    ) {
        return;
    }


    try {

        console.log(
            "DELETE:",
            `/products/${deletingProductId}`
        );


        const response =
            await API.delete(
                `/products/${deletingProductId}`
            );


        console.log(
            "Delete response:",
            response.status
        );


        if (!response.ok) {

            const text =
                await response.text();

            throw new Error(
                text ||
                "Unable to delete product."
            );

        }


        deleteProductModal.hide();


        deletingProductId = null;


        await loadProducts();


        showProductMessage(
            "Product deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );


        showDeleteAlert(
            error.message,
            "danger"
        );

    }

}


/* ============================================================
   FORM HELPERS
   ============================================================ */

function clearProductForm() {

    document.getElementById(
        "productForm"
    ).reset();


    document.getElementById(
        "alertStock"
    ).value = 5;

}


function clearFormAlert() {

    const alert =
        document.getElementById(
            "productFormAlert"
        );


    alert.className =
        "alert d-none";


    alert.textContent =
        "";

}


function showFormAlert(
    message,
    type = "danger"
) {

    const alert =
        document.getElementById(
            "productFormAlert"
        );


    alert.className =
        `alert alert-${type}`;


    alert.textContent =
        message;

}


function clearDeleteAlert() {

    const alert =
        document.getElementById(
            "deleteProductAlert"
        );


    alert.className =
        "alert d-none";


    alert.textContent =
        "";

}


function showDeleteAlert(
    message,
    type = "danger"
) {

    const alert =
        document.getElementById(
            "deleteProductAlert"
        );


    alert.className =
        `alert alert-${type}`;


    alert.textContent =
        message;

}


function showProductMessage(
    message,
    type = "info"
) {

    const container =
        document.getElementById(
            "productMessage"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="alert alert-${type}">

            ${escapeHtml(message)}

        </div>

    `;

}


/* ============================================================
   FORMATTERS
   ============================================================ */

function formatCategory(category) {

    if (!category) {
        return "";
    }


    return String(category)
        .replaceAll("_", " ")
        .replace(
            /\w\S*/g,
            text =>
                text.charAt(0).toUpperCase() +
                text.substring(1).toLowerCase()
        );

}


function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}



// /*
//  * ============================================================
//  * PRODUCTS MODULE
//  * ============================================================
//  */


// let products = [];

// let filteredProducts = [];

// let editingProductId = null;

// let deletingProductId = null;

// let currentPage = 1;

// const pageSize = 10;


// /*
//  * Bootstrap modals
//  */

// let productModal;

// let deleteProductModal;



// /*
//  * ============================================================
//  * INITIALIZATION
//  * ============================================================
//  */

// document.addEventListener(
//     "DOMContentLoaded",
//     async function () {

//         const user =
//             Session.getUser();


//         if (!user) {

//             window.location.href =
//                 "../index.html";

//             return;
//         }


//         /*
//          * Render the common layout
//          */

//         renderLayout();


//         /*
//          * Render Products page
//          */

//         applyRolePermissions();


//         /*
//          * Initialize Bootstrap modals
//          */

//         productModal =
//             new bootstrap.Modal(
//                 document.getElementById(
//                     "productModal"
//                 )
//             );


//         deleteProductModal =
//             new bootstrap.Modal(
//                 document.getElementById(
//                     "deleteProductModal"
//                 )
//             );


//         /*
//          * Load categories
//          */

//         await loadCategories();


//         /*
//          * Load products
//          */

//         await loadProducts();

//     }
// );

// /*
//  * ============================================================
//  * EVENTS
//  * ============================================================
//  */

// function setupEvents() {


//     /*
//      * Add product
//      */

//     const addButton =
//         document.getElementById(
//             "addProductButton"
//         );


//     if (addButton) {

//         addButton.addEventListener(
//             "click",
//             openAddProductModal
//         );

//     }


//     /*
//      * Product form
//      */

//     const form =
//         document.getElementById(
//             "productForm"
//         );


//     if (form) {

//         form.addEventListener(
//             "submit",
//             handleProductSubmit
//         );

//     }


//     /*
//      * Delete confirmation
//      */

//     const deleteButton =
//         document.getElementById(
//             "confirmDeleteButton"
//         );


//     if (deleteButton) {

//         deleteButton.addEventListener(
//             "click",
//             confirmDeleteProduct
//         );

//     }


//     /*
//      * Search
//      */

//     const searchInput =
//         document.getElementById(
//             "productSearch"
//         );


//     if (searchInput) {

//         searchInput.addEventListener(
//             "input",
//             handleSearch
//         );

//     }

// }



// /*
//  * ============================================================
//  * LOAD PRODUCTS
//  * ============================================================
//  */

// async function loadProducts() {

//     showLoading();


//     try {

//         const response =
//             await API.get("/products");


//         if (!response) {

//             return;
//         }


//         const data =
//             await response.json();


//         if (!response.ok) {

//             throw new Error(
//                 extractApiError(data)
//             );

//         }


//         products =
//             Array.isArray(data)
//                 ? data
//                 : [];


//         filteredProducts =
//             [...products];


//         currentPage = 1;


//         renderProducts();


//     } catch (error) {

//         console.error(
//             "Failed to load products:",
//             error
//         );


//         showTableError(
//             error.message
//         );

//     }

// }



// /*
//  * ============================================================
//  * LOAD CATEGORIES
//  * ============================================================
//  */

// async function loadCategories() {

//     const select =
//         document.getElementById(
//             "productCategory"
//         );


//     if (!select) {

//         return;
//     }


//     try {

//         const response =
//             await API.get(
//                 "/product-categories"
//             );


//         if (!response) {

//             return;
//         }


//         const categories =
//             await response.json();


//         if (!response.ok) {

//             throw new Error(
//                 extractApiError(categories)
//             );

//         }


//         select.innerHTML = `

//             <option value="">
//                 Select category
//             </option>

//         `;


//         categories.forEach(
//             category => {

//                 const option =
//                     document.createElement(
//                         "option"
//                     );


//                 option.value =
//                     category;


//                 option.textContent =
//                     formatEnumLabel(
//                         category
//                     );


//                 select.appendChild(
//                     option
//                 );

//             }
//         );


//     } catch (error) {

//         console.error(
//             "Failed to load categories:",
//             error
//         );

//     }

// }



// /*
//  * ============================================================
//  * RENDER PRODUCTS
//  * ============================================================
//  */

// function renderProducts() {

//     const tbody =
//         document.getElementById(
//             "productsTableBody"
//         );


//     if (!tbody) {

//         return;
//     }


//     if (
//         filteredProducts.length === 0
//     ) {

//         tbody.innerHTML = `

//             <tr>

//                 <td
//                     colspan="9"
//                     class="text-center py-5">

//                     <div class="text-muted">

//                         No products found.

//                     </div>

//                 </td>

//             </tr>

//         `;


//         renderPagination();

//         return;
//     }


//     const start =
//         (currentPage - 1)
//         * pageSize;


//     const end =
//         start + pageSize;


//     const pageProducts =
//         filteredProducts.slice(
//             start,
//             end
//         );


//     tbody.innerHTML = "";


//     pageProducts.forEach(
//         product => {

//             const row =
//                 document.createElement(
//                     "tr"
//                 );


//             row.innerHTML = `

//                 <td>
//                     ${product.id}
//                 </td>


//                 <td>

//                     <div class="fw-semibold">

//                         ${escapeHtml(
//                             product.productName
//                         )}

//                     </div>

//                 </td>


//                 <td>

//                     <span class="badge bg-light text-dark">

//                         ${formatEnumLabel(
//                             product.productCategory
//                         )}

//                     </span>

//                 </td>


//                 <td>

//                     ${formatMoney(
//                         product.purchasePrice
//                     )}

//                 </td>


//                 <td>

//                     ${formatMoney(
//                         product.sellingPrice
//                     )}

//                 </td>


//                 <td>

//                     ${product.stock}

//                     ${escapeHtml(
//                         product.unit
//                     )}

//                 </td>


//                 <td>

//                     ${getStockStatus(
//                         product
//                     )}

//                 </td>


//                 <td>

//                     ${formatDate(
//                         product.updatedAt
//                     )}

//                 </td>


//                 <td>

//                     <div
//                         class="d-flex
//                                gap-1
//                                justify-content-end">

//                         ${
//                             canEditProducts()
//                             ? `

//                                 <button
//                                     type="button"
//                                     class="btn
//                                            btn-sm
//                                            btn-outline-primary"
//                                     onclick="openEditProductModal(${product.id})">

//                                     Edit

//                                 </button>

//                             `
//                             : ""
//                         }


//                         ${
//                             canDeleteProducts()
//                             ? `

//                                 <button
//                                     type="button"
//                                     class="btn
//                                            btn-sm
//                                            btn-outline-danger"
//                                     onclick="openDeleteProductModal(${product.id})">

//                                     Delete

//                                 </button>

//                             `
//                             : ""
//                         }

//                     </div>

//                 </td>

//             `;


//             tbody.appendChild(
//                 row
//             );

//         }
//     );


//     renderPagination();

// }



// /*
//  * ============================================================
//  * STOCK STATUS
//  * ============================================================
//  */

// function getStockStatus(product) {

//     const stock =
//         Number(product.stock);


//     const alertStock =
//         Number(product.alertStock);


//     if (stock <= 0) {

//         return `

//             <span class="badge bg-danger">

//                 Out of Stock

//             </span>

//         `;

//     }


//     if (stock <= alertStock) {

//         return `

//             <span class="badge bg-warning text-dark">

//                 Low Stock

//             </span>

//         `;

//     }


//     return `

//         <span class="badge bg-success">

//             In Stock

//         </span>

//     `;

// }



// /*
//  * ============================================================
//  * SEARCH
//  * ============================================================
//  */

// function handleSearch(event) {

//     const search =
//         event.target.value
//             .trim()
//             .toLowerCase();


//     if (!search) {

//         filteredProducts =
//             [...products];

//     } else {

//         filteredProducts =
//             products.filter(
//                 product =>

//                     product.productName
//                         .toLowerCase()
//                         .includes(search)

//                     ||

//                     product.productCategory
//                         .toLowerCase()
//                         .includes(search)

//                     ||

//                     product.unit
//                         .toLowerCase()
//                         .includes(search)
//             );

//     }


//     currentPage = 1;

//     renderProducts();

// }



// /*
//  * ============================================================
//  * PAGINATION
//  * ============================================================
//  */

// function renderPagination() {

//     const pagination =
//         document.getElementById(
//             "productsPagination"
//         );


//     if (!pagination) {

//         return;
//     }


//     const totalPages =
//         Math.ceil(
//             filteredProducts.length
//             / pageSize
//         );


//     pagination.innerHTML = "";


//     if (totalPages <= 1) {

//         return;
//     }


//     for (
//         let page = 1;
//         page <= totalPages;
//         page++
//     ) {

//         const li =
//             document.createElement(
//                 "li"
//             );


//         li.className =
//             `page-item ${
//                 page === currentPage
//                     ? "active"
//                     : ""
//             }`;


//         li.innerHTML = `

//             <button
//                 class="page-link">

//                 ${page}

//             </button>

//         `;


//         li.querySelector(
//             "button"
//         ).addEventListener(
//             "click",
//             () => {

//                 currentPage =
//                     page;

//                 renderProducts();

//             }
//         );


//         pagination.appendChild(
//             li
//         );

//     }

// }



// /*
//  * ============================================================
//  * ADD PRODUCT
//  * ============================================================
//  */

// function openAddProductModal() {

//     editingProductId =
//         null;


//     document.getElementById(
//         "productForm"
//     ).reset();


//     document.getElementById(
//         "productModalTitle"
//     ).textContent =
//         "Add Product";


//     document.getElementById(
//         "alertStock"
//     ).value =
//         "5";


//     clearFormAlert();


//     productModal.show();

// }



// /*
//  * ============================================================
//  * EDIT PRODUCT
//  * ============================================================
//  */

// function openEditProductModal(
//     productId
// ) {

//     const product =
//         products.find(
//             p => p.id === productId
//         );


//     if (!product) {

//         return;
//     }


//     editingProductId =
//         productId;


//     document.getElementById(
//         "productModalTitle"
//     ).textContent =
//         "Edit Product";


//     document.getElementById(
//         "productName"
//     ).value =
//         product.productName;


//     document.getElementById(
//         "productCategory"
//     ).value =
//         product.productCategory;


//     document.getElementById(
//         "purchasePrice"
//     ).value =
//         product.purchasePrice;


//     document.getElementById(
//         "sellingPrice"
//     ).value =
//         product.sellingPrice;


//     document.getElementById(
//         "stock"
//     ).value =
//         product.stock;


//     document.getElementById(
//         "unit"
//     ).value =
//         product.unit;


//     document.getElementById(
//         "alertStock"
//     ).value =
//         product.alertStock;


//     clearFormAlert();


//     productModal.show();

// }



// /*
//  * ============================================================
//  * SUBMIT PRODUCT
//  * ============================================================
//  */
// async function handleProductSubmit(event) {

//     event.preventDefault();

//     console.log("========== PRODUCT FORM SUBMIT ==========");

//     clearFormAlert();

//     const button =
//         document.getElementById("saveProductButton");


//     const request = {

//         productName:
//             document.getElementById("productName")
//                 .value
//                 .trim(),

//         productCategory:
//             document.getElementById("productCategory")
//                 .value,

//         purchasePrice:
//             Number(
//                 document.getElementById("purchasePrice")
//                     .value
//             ),

//         sellingPrice:
//             Number(
//                 document.getElementById("sellingPrice")
//                     .value
//             ),

//         stock:
//             Number(
//                 document.getElementById("stock")
//                     .value
//             ),

//         unit:
//             document.getElementById("unit")
//                 .value
//                 .trim(),

//         alertStock:
//             Number(
//                 document.getElementById("alertStock")
//                     .value
//             )
//     };


//     console.log("Product request:", request);
//     console.log(
//         "Editing product ID:",
//         editingProductId
//     );


//     button.disabled = true;

//     button.textContent =
//         editingProductId
//             ? "Updating..."
//             : "Saving...";


//     try {

//         let response;


//         /*
//          * UPDATE
//          */

//         if (editingProductId !== null) {

//             console.log(
//                 "PUT:",
//                 `/products/${editingProductId}`
//             );


//             response = await API.put(
//                 `/products/${editingProductId}`,
//                 request
//             );

//         }


//         /*
//          * CREATE
//          */

//         else {

//             console.log(
//                 "POST:",
//                 "/products"
//             );


//             response = await API.post(
//                 "/products",
//                 request
//             );

//         }


//         /*
//          * Make sure we actually received
//          * a response.
//          */

//         if (!response) {

//             throw new Error(
//                 "No response received from the server."
//             );

//         }


//         console.log(
//             "Backend status:",
//             response.status
//         );


//         /*
//          * Read response body
//          *
//          * DELETE is not involved here,
//          * so POST/PUT should normally return JSON.
//          */

//         const text =
//             await response.text();


//         console.log(
//             "Backend response:",
//             text
//         );


//         let data = null;


//         if (text) {

//             try {

//                 data =
//                     JSON.parse(text);

//             } catch {

//                 data = text;

//             }

//         }


//         /*
//          * Backend rejected request
//          */

//         if (!response.ok) {

//             throw new Error(
//                 extractApiError(data)
//             );

//         }


//         /*
//          * SUCCESS
//          */

//         console.log(
//             "Product saved successfully."
//         );


//         productModal.hide();


//         /*
//          * Reload products from backend
//          */

//         await loadProducts();


//         showToast(
//             editingProductId !== null
//                 ? "Product updated successfully."
//                 : "Product created successfully.",
//             "success"
//         );


//         editingProductId = null;


//     } catch (error) {

//         console.error(
//             "PRODUCT SAVE ERROR:",
//             error
//         );


//         showFormAlert(
//             error.message ||
//             "Unable to save product.",
//             "danger"
//         );

//     } finally {

//         button.disabled = false;

//         button.textContent =
//             "Save Product";

//     }

// }

// // async function handleProductSubmit(
// //     event
// // ) {

// //     event.preventDefault();


// //     clearFormAlert();


// //     const button =
// //         document.getElementById(
// //             "saveProductButton"
// //         );


// //     const request = {

// //         productName:
// //             document.getElementById(
// //                 "productName"
// //             ).value.trim(),

// //         productCategory:
// //             document.getElementById(
// //                 "productCategory"
// //             ).value,

// //         purchasePrice:
// //             Number(
// //                 document.getElementById(
// //                     "purchasePrice"
// //                 ).value
// //             ),

// //         sellingPrice:
// //             Number(
// //                 document.getElementById(
// //                     "sellingPrice"
// //                 ).value
// //             ),

// //         stock:
// //             Number(
// //                 document.getElementById(
// //                     "stock"
// //                 ).value
// //             ),

// //         unit:
// //             document.getElementById(
// //                 "unit"
// //             ).value.trim(),

// //         alertStock:
// //             Number(
// //                 document.getElementById(
// //                     "alertStock"
// //                 ).value
// //             )

// //     };


// //     button.disabled =
// //         true;


// //     button.textContent =
// //         editingProductId
// //             ? "Updating..."
// //             : "Saving...";


// //     try {

// //         let response;


// //         if (editingProductId) {

// //             response =
// //                 await API.put(
// //                     `/products/${editingProductId}`,
// //                     request
// //                 );

// //         } else {

// //             response =
// //                 await API.post(
// //                     "/products",
// //                     request
// //                 );

// //         }


// //         if (!response) {

// //             return;
// //         }


// //         const data =
// //             await response.json();


// //         if (!response.ok) {

// //             throw new Error(
// //                 extractApiError(data)
// //             );

// //         }


// //         productModal.hide();


// //         await loadProducts();


// //         showToast(
// //             editingProductId
// //                 ? "Product updated successfully."
// //                 : "Product created successfully.",
// //             "success"
// //         );


// //         editingProductId =
// //             null;


// //     } catch (error) {

// //         console.error(
// //             "Product save failed:",
// //             error
// //         );


// //         showFormAlert(
// //             error.message,
// //             "danger"
// //         );

// //     } finally {

// //         button.disabled =
// //             false;


// //         button.textContent =
// //             editingProductId
// //                 ? "Update Product"
// //                 : "Save Product";

// //     }

// // }



// /*
//  * ============================================================
//  * DELETE PRODUCT MODAL
//  * ============================================================
//  */

// function openDeleteProductModal(
//     productId
// ) {

//     const product =
//         products.find(
//             p => p.id === productId
//         );


//     if (!product) {

//         return;
//     }


//     deletingProductId =
//         productId;


//     document.getElementById(
//         "deleteProductName"
//     ).textContent =
//         product.productName;


//     document.getElementById(
//         "deleteProductAlert"
//     ).className =
//         "alert d-none";


//     deleteProductModal.show();

// }



// /*
//  * ============================================================
//  * DELETE PRODUCT
//  * ============================================================
//  */

// async function confirmDeleteProduct() {

//     if (!deletingProductId) {

//         return;
//     }


//     const button =
//         document.getElementById(
//             "confirmDeleteButton"
//         );


//     button.disabled =
//         true;


//     button.textContent =
//         "Deleting...";


//     try {

//         const response =
//             await API.delete(
//                 `/products/${deletingProductId}`
//             );


//         if (!response) {

//             return;
//         }


//         if (!response.ok) {

//             const data =
//                 await response.json();


//             throw new Error(
//                 extractApiError(data)
//             );

//         }


//         deleteProductModal.hide();


//         await loadProducts();


//         showToast(
//             "Product deleted successfully.",
//             "success"
//         );


//     } catch (error) {

//         console.error(
//             "Delete failed:",
//             error
//         );


//         showDeleteAlert(
//             error.message
//         );

//     } finally {

//         button.disabled =
//             false;


//         button.textContent =
//             "Delete";


//         deletingProductId =
//             null;

//     }

// }



// /*
//  * ============================================================
//  * ROLE PERMISSIONS
//  * ============================================================
//  */

// function getCurrentRole() {

//     const user =
//         Session.getUser();


//     return user?.role ||
//         "USER";

// }


// function canEditProducts() {

//     const role =
//         getCurrentRole();


//     return (
//         role === "ADMIN" ||
//         role === "MANAGER"
//     );

// }


// function canDeleteProducts() {

//     return (
//         getCurrentRole() ===
//         "ADMIN"
//     );

// }


// function canCreateProducts() {

//     return (
//         getCurrentRole() === "ADMIN" ||
//         getCurrentRole() === "MANAGER"
//     );

// }



// /*
//  * ============================================================
//  * ROLE-BASED UI
//  * ============================================================
//  */

// function applyRolePermissions() {

//     const container =
//         document.getElementById(
//             "pageContent"
//         );


//     if (!container) {

//         return;
//     }


//     container.innerHTML = `

//         <div
//             class="d-flex
//                    flex-wrap
//                    justify-content-between
//                    align-items-center
//                    gap-2
//                    mb-4">

//             <div>

//                 <h2 class="mb-1">

//                     Products

//                 </h2>

//                 <p class="text-muted mb-0">

//                     Manage your products and inventory.

//                 </p>

//             </div>


//             ${
//                 canCreateProducts()
//                 ? `

//                     <button
//                         type="button"
//                         id="addProductButton"
//                         class="btn btn-primary">

//                         + Add Product

//                     </button>

//                 `
//                 : ""
//             }

//         </div>



//         <!-- SEARCH -->

//         <div
//             class="card shadow-sm mb-4">

//             <div class="card-body">

//                 <div
//                     class="row
//                            align-items-center">

//                     <div class="col-md-6">

//                         <label
//                             for="productSearch"
//                             class="form-label">

//                             Search products

//                         </label>

//                         <input
//                             type="search"
//                             id="productSearch"
//                             class="form-control"
//                             placeholder="Search by name, category or unit...">

//                     </div>


//                     <div
//                         class="col-md-6
//                                text-md-end
//                                mt-3
//                                mt-md-0">

//                         <div
//                             class="text-muted">

//                             Total products:

//                             <strong
//                                 id="productCount">

//                                 0

//                             </strong>

//                         </div>

//                     </div>

//                 </div>

//             </div>

//         </div>



//         <!-- TABLE -->

//         <div
//             class="card shadow-sm">

//             <div class="card-body p-0">

//                 <div
//                     class="table-responsive">

//                     <table
//                         class="table
//                                table-hover
//                                align-middle
//                                mb-0">

//                         <thead
//                             class="table-light">

//                             <tr>

//                                 <th>ID</th>

//                                 <th>Product</th>

//                                 <th>Category</th>

//                                 <th>Purchase</th>

//                                 <th>Selling</th>

//                                 <th>Stock</th>

//                                 <th>Status</th>

//                                 <th>Updated</th>

//                                 <th
//                                     class="text-end">

//                                     Actions

//                                 </th>

//                             </tr>

//                         </thead>


//                         <tbody
//                             id="productsTableBody">

//                         </tbody>

//                     </table>

//                 </div>

//             </div>



//             <!-- PAGINATION -->

//             <div
//                 class="card-footer
//                        bg-white">

//                 <nav>

//                     <ul
//                         id="productsPagination"
//                         class="pagination
//                                justify-content-center
//                                mb-0">

//                     </ul>

//                 </nav>

//             </div>

//         </div>

//     `;


//     /*
//      * Reconnect add button because
//      * pageContent was recreated.
//      */

//     const addButton =
//         document.getElementById(
//             "addProductButton"
//         );


//     if (addButton) {

//         addButton.addEventListener(
//             "click",
//             openAddProductModal
//         );

//     }


//     renderProducts();

// }



// /*
//  * ============================================================
//  * LOADING
//  * ============================================================
//  */

// function showLoading() {

//     const tbody =
//         document.getElementById(
//             "productsTableBody"
//         );


//     if (!tbody) {

//         return;
//     }


//     tbody.innerHTML = `

//         <tr>

//             <td
//                 colspan="9"
//                 class="text-center py-5">

//                 <div
//                     class="spinner-border text-primary"
//                     role="status">

//                     <span class="visually-hidden">
//                         Loading...
//                     </span>

//                 </div>

//                 <div
//                     class="text-muted mt-2">

//                     Loading products...

//                 </div>

//             </td>

//         </tr>

//     `;

// }



// /*
//  * ============================================================
//  * TABLE ERROR
//  * ============================================================
//  */

// function showTableError(
//     message
// ) {

//     const tbody =
//         document.getElementById(
//             "productsTableBody"
//         );


//     if (!tbody) {

//         return;
//     }


//     tbody.innerHTML = `

//         <tr>

//             <td
//                 colspan="9"
//                 class="text-center py-5">

//                 <div class="text-danger mb-2">

//                     Unable to load products.

//                 </div>

//                 <small class="text-muted">

//                     ${escapeHtml(
//                         message
//                     )}

//                 </small>

//             </td>

//         </tr>

//     `;

// }



// /*
//  * ============================================================
//  * FORM ALERT
//  * ============================================================
//  */

// function showFormAlert(
//     message,
//     type = "danger"
// ) {

//     const alert =
//         document.getElementById(
//             "productFormAlert"
//         );


//     if (!alert) {

//         return;
//     }


//     alert.className =
//         `alert alert-${type}`;


//     alert.textContent =
//         message;

// }


// function clearFormAlert() {

//     const alert =
//         document.getElementById(
//             "productFormAlert"
//         );


//     if (!alert) {

//         return;
//     }


//     alert.className =
//         "alert d-none";


//     alert.textContent =
//         "";

// }


// function showDeleteAlert(
//     message
// ) {

//     const alert =
//         document.getElementById(
//             "deleteProductAlert"
//         );


//     if (!alert) {

//         return;
//     }


//     alert.className =
//         "alert alert-danger";


//     alert.textContent =
//         message;

// }



// /*
//  * ============================================================
//  * TOAST
//  * ============================================================
//  */

// function showToast(
//     message,
//     type = "success"
// ) {

//     let container =
//         document.getElementById(
//             "toastContainer"
//         );


//     if (!container) {

//         container =
//             document.createElement(
//                 "div"
//             );


//         container.id =
//             "toastContainer";


//         container.className =
//             "toast-container position-fixed top-0 end-0 p-3";


//         document.body.appendChild(
//             container
//         );

//     }


//     const toast =
//         document.createElement(
//             "div"
//         );


//     toast.className =
//         `toast align-items-center text-bg-${type} border-0`;


//     toast.setAttribute(
//         "role",
//         "alert"
//     );


//     toast.innerHTML = `

//         <div class="d-flex">

//             <div class="toast-body">

//                 ${escapeHtml(message)}

//             </div>

//             <button
//                 type="button"
//                 class="btn-close btn-close-white me-2 m-auto"
//                 data-bs-dismiss="toast">
//             </button>

//         </div>

//     `;


//     container.appendChild(
//         toast
//     );


//     const bsToast =
//         new bootstrap.Toast(
//             toast,
//             {
//                 delay: 3000
//             }
//         );


//     bsToast.show();


//     toast.addEventListener(
//         "hidden.bs.toast",
//         () => {

//             toast.remove();

//         }
//     );

// }



// /*
//  * ============================================================
//  * FORMAT HELPERS
//  * ============================================================
//  */

// function formatEnumLabel(
//     value
// ) {

//     if (!value) {

//         return "";

//     }


//     return value
//         .toLowerCase()
//         .replace(
//             /_/g,
//             " "
//         )
//         .replace(
//             /\b\w/g,
//             char =>
//                 char.toUpperCase()
//         );

// }



// function formatMoney(
//     value
// ) {

//     const number =
//         Number(value);


//     if (
//         Number.isNaN(number)
//     ) {

//         return "0.00";

//     }


//     return number.toFixed(2);

// }



// function formatDate(
//     value
// ) {

//     if (!value) {

//         return "-";

//     }


//     const date =
//         new Date(value);


//     if (
//         Number.isNaN(
//             date.getTime()
//         )
//     ) {

//         return "-";

//     }


//     return date.toLocaleDateString();

// }



// /*
//  * ============================================================
//  * API ERROR
//  * ============================================================
//  */

// function extractApiError(
//     data
// ) {

//     if (!data) {

//         return "An unexpected error occurred.";

//     }


//     if (
//         typeof data === "string"
//     ) {

//         return data;

//     }


//     if (data.message) {

//         return data.message;

//     }


//     if (
//         data.error
//     ) {

//         return data.error;

//     }


//     /*
//      * Spring validation errors
//      */

//     if (
//         data.errors &&
//         typeof data.errors === "object"
//     ) {

//         return Object.values(
//             data.errors
//         ).join(", ");

//     }


//     return "An unexpected error occurred.";

// }



// /*
//  * ============================================================
//  * HTML ESCAPE
//  * ============================================================
//  */

// function escapeHtml(
//     value
// ) {

//     const element =
//         document.createElement(
//             "div"
//         );


//     element.textContent =
//         value ?? "";


//     return element.innerHTML;

// }
const API = {

    baseUrl: "https://stock-sale-mgnt-backend.onrender.com/api",


    // ============================================================
    // GENERIC REQUEST
    // ============================================================

    async request(endpoint, options = {}) {

        // IMPORTANT:
        // Session.js uses "token", so use the SAME key here.
        const token =
            localStorage.getItem("token");


        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...options.headers
        };


        if (token) {

            headers["Authorization"] =
                `Bearer ${token}`;

        }


        console.log("================================");
        console.log("API REQUEST");
        console.log("Endpoint:", endpoint);
        console.log("Method:", options.method || "GET");
        console.log(
            "JWT:",
            token ? "FOUND" : "NOT FOUND"
        );


        if (options.body) {

            console.log(
                "Body:",
                options.body
            );

        }


        const response =
            await fetch(
                `${this.baseUrl}${endpoint}`,
                {
                    ...options,
                    headers
                }
            );


        console.log(
            "Response Status:",
            response.status
        );


        // Clone response so we can inspect it
        const responseClone =
            response.clone();


        try {

            const responseData =
                await responseClone.json();

            console.log(
                "Response Body:",
                responseData
            );

        } catch {

            console.log(
                "Response Body: non-JSON response"
            );

        }


        console.log("================================");


        return response;
    },


    // ============================================================
    // GET
    // ============================================================

    get(endpoint) {

        return this.request(
            endpoint,
            {
                method: "GET"
            }
        );

    },


    // ============================================================
    // POST
    // ============================================================

    post(endpoint, data) {

        return this.request(
            endpoint,
            {
                method: "POST",

                body: JSON.stringify(data)
            }
        );

    },


    // ============================================================
    // PUT
    // ============================================================

    put(endpoint, data) {

        return this.request(
            endpoint,
            {
                method: "PUT",

                body: JSON.stringify(data)
            }
        );

    },


    // ============================================================
    // DELETE
    // ============================================================

    delete(endpoint) {

        return this.request(
            endpoint,
            {
                method: "DELETE"
            }
        );

    }

};

// const API = {

//     baseUrl: "http://localhost:8080/api",


//     async request(endpoint, options = {}) {

//         const token =
//             Session.getToken();


//         const headers = {
//             "Content-Type": "application/json",
//             ...options.headers
//         };


//         if (token) {

//             headers["Authorization"] =
//                 `Bearer ${token}`;

//         }


//         console.log(
//             "================================="
//         );

//         console.log(
//             "API REQUEST:",
//             options.method || "GET",
//             endpoint
//         );

//         console.log(
//             "JWT:",
//             token
//                 ? "FOUND"
//                 : "NOT FOUND"
//         );


//         const response =
//             await fetch(
//                 `${this.baseUrl}${endpoint}`,
//                 {
//                     // ...options,
//                     headers
//                 }
//             );


//         console.log(
//             "API RESPONSE:",
//             response.status,
//             endpoint
//         );


//         console.log(
//             "================================="
//         );


//         return response;

//     },


//     get(endpoint) {

//         return this.request(
//             endpoint,
//             {
//                 method: "GET"
//             }
//         );

//     },


//     post(endpoint, data) {

//         return this.request(
//             endpoint,
//             {
//                 method: "POST",
//                 body: JSON.stringify(data)
//             }
//         );

//     },


//     put(endpoint, data) {

//         return this.request(
//             endpoint,
//             {
//                 method: "PUT",
//                 body: JSON.stringify(data)
//             }
//         );

//     },


//     delete(endpoint) {

//         return this.request(
//             endpoint,
//             {
//                 method: "DELETE"
//             }
//         );

//     }

// };


// const API = {

//     baseUrl: "http://localhost:8080/api",


//     async request(endpoint, options = {}) {

//         /*
//          * Get JWT from the same key used by Session.js
//          */
//         const token =
//             Session.getToken();


//         const headers = {
//             "Content-Type": "application/json",
//             ...options.headers
//         };


//         /*
//          * Add JWT to request
//          */
//         if (token) {

//             headers["Authorization"] =
//                 `Bearer ${token}`;

//         }


//         console.log("=================================");
//         console.log("API REQUEST");
//         console.log("Endpoint:", endpoint);
//         console.log(
//             "JWT:",
//             token ? "FOUND" : "NOT FOUND"
//         );


//         const response =
//             await fetch(
//                 `${this.baseUrl}${endpoint}`,
//                 {
//                     ...options,
//                     headers
//                 }
//             );


//         console.log(
//             "Response:",
//             response.status
//         );

//         console.log("=================================");


//         /*
//          * JWT expired or invalid
//          */
//         if (response.status === 401) {

//             console.warn(
//                 "Authentication failed."
//             );

//             /*
//              * We don't logout here immediately.
//              * Let the calling page handle the response.
//              */

//         }


//         return response;
//     },


//     /*
//      * GET
//      */
//     get(endpoint) {

//         return this.request(
//             endpoint,
//             {
//                 method: "GET"
//             }
//         );

//     },


//     /*
//      * POST
//      */
//     post(endpoint, data) {

//         return this.request(
//             endpoint,
//             {
//                 method: "POST",
//                 body: JSON.stringify(data)
//             }
//         );

//     },


//     /*
//      * PUT
//      */
//     put(endpoint, data) {

//         return this.request(
//             endpoint,
//             {
//                 method: "PUT",
//                 body: JSON.stringify(data)
//             }
//         );

//     },


//     /*
//      * DELETE
//      */
//     delete(endpoint) {

//         return this.request(
//             endpoint,
//             {
//                 method: "DELETE"
//             }
//         );

//     }

// };
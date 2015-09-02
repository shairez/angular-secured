angular.module("ngSecured.services")
    .constant("ngSecured.cacheOptions", {
        "timeout": {
            "FOREVER": "forever"
        },
        "location":{
            "LOCAL_STORAGE": "localStorage",
            "SESSION_STORAGE": "sessionStorage"
        },
        "cacheKeys": {
            MAIN_CACHE: "ngSecuredCache",
            LOGIN_CACHE: 'loginCache',
            IS_LOGGED_IN: "isLoggedIn",
            ROLES: "roles"
        }

    })

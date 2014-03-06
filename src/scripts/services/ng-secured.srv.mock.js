angular.module("mocks.ngSecured", [])
    .factory("ngSecured", function ($q) {

        var mock = jasmine.createSpyObj("ngSecured",
            ["includesRole",
             "loggingIn",
            "fetchingRoles",
            "isAuthenticated",
            "setRoles",
            "getRoles",
            "loggingOut"]);
        mock.$deferred = {

        }
        return mock;
    });

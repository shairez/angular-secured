angular.module("mocks.$angularCacheFactory", [])
    .factory("$angularCacheFactory", function ($q) {

        var spy = jasmine.createSpy("$angularCacheFactory");

        var mock = jasmine.createSpyObj("$angularCache",
            ["put",
             "get",
             "removeAll"]);

        spy.andReturn(mock);
        return spy;
    });

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

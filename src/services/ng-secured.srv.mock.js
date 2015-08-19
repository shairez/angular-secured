angular.module("mocks.ngSecured", [])
    .factory("ngSecured", function ($q) {

        var mock = jasmine.createSpyObj("ngSecured",
            [
              'login',
              'logout',
              'isLoggedIn'
            ]);
        mock.$deferred = {

        }
        return mock;
    });

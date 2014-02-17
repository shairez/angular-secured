angular.module("mocks.ngSecured", [])
    .factory("ngSecured", function ($q) {

        var mock = jasmine.createSpyObj("ngSecured",
            ["includesRole",
             "getRoles"]);
        mock.$deferred = {

        }
        return mock;
    });

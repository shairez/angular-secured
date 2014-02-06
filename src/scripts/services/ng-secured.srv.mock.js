angular.module("mocks.ngSecured", [])
    .factory("ngSecured", function ($q) {

        var mock = jasmine.createSpyObj("ngSecured",
            ["includesRole"]);
        mock.$deferred = {

        }
        return mock;
    });

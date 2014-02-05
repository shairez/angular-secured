angular.module("mocks.ngSecured", [])
    .factory("ngSecured", function ($q) {

        var mock = jasmine.createSpyObj("ngSecured",
            ["includeRole"]);
        mock.$deferred = {

        }
        return mock;
    });

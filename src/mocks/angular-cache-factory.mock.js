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

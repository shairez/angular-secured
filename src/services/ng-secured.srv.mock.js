(function () {

  angular
    .module("mocks.ngSecured", [])
    .factory("ngSecured", factory);

  function factory($q) {

    var mock = jasmine.createSpyObj("ngSecured",
      [
        'login',
        'logout',
        'isLoggedIn'
      ]);

    mock.$deferred = {
      login: $q.defer()
    };
    mock.login.and.returnValue(mock.$deferred.login.promise);

    return mock;
  }
})();

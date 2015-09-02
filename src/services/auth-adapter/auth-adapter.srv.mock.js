(function () {

  angular
    .module('mocks.ngSecured.authAdapter', [])
    .provider('ngSecured.authAdapter', providerMock);

  function providerMock(){
    this.setup = jasmine.createSpy('authAdapter.setup');
    this.$get = mockFactory;
  }

  function mockFactory($q) {
    var mock = jasmine.createSpyObj('ngSecured.authAdapter',
      ['login',
       'isLoggedIn',
       'logout']);

    mock.$deferred = {
      login: $q.defer(),
      logout: $q.defer()
    }
    mock.login.and.returnValue(mock.$deferred.login.promise);
    mock.logout.and.returnValue(mock.$deferred.logout.promise);
    return mock;
  };

})();

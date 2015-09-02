(function () {

  angular
    .module('mocks.ngSecured.loopback.authAdapter', [])
    .provider('ngSecured.authAdapter', providerMock);

  function providerMock(){
    this.setup = jasmine.createSpy('authAdapter.setup');
    this.$get = mockFactory;
  }

  function mockFactory($q) {
    var mock = jasmine.createSpyObj('ngSecured.authAdapter',
      ['login',
       'isLoggedIn',
       'logout',
       'getToken',
       'setToken']);

    mock.$deferred = {
      login: $q.defer()
    }
    mock.login.and.returnValue(mock.$deferred.login.promise);
    return mock;
  };

})();

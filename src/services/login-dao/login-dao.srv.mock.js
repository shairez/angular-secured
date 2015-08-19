(function () {

  angular
    .module('mocks.ngSecured.loginDao', [])
    .provider('ngSecured.loginDao', providerMock);

  function providerMock(){
    this.setup = jasmine.createSpy('loginDao.setup');
    this.$get = mockFactory;
  }

  function mockFactory($q) {
    var mock = jasmine.createSpyObj('ngSecured.loginDao',
      ['login',
       'isLoggedIn',
       'logout',
       'getToken',
       'setToken']);

    mock.$deferred = {
      login: $q.defer()
    }
    mock.login.andReturn(mock.$deferred.login.promise);
    return mock;
  };

})();

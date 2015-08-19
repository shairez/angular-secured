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

(function () {


  angular
    .module('mocks.CacheFactory', [])
    .factory('CacheFactory', factory);

  function factory($q) {

    var spy = jasmine.createSpy('CacheFactory');

    spy.get = jasmine.createSpy('CacheFactory.get');

    var mock = jasmine.createSpyObj('Cache',
      ['put',
       'get',
       'destroy',
       'remove',
       'removeAll']);

    spy.andReturn(mock);
    return spy;
  }
})();

(function () {

  var uiRouterMockModule = angular.module('mocks.ui.router', []);

  uiRouterMockModule.provider('$state', function () {

    this.state = jasmine.createSpy('$stateProvider.state');

    var $stateMock = jasmine.createSpyObj('$state',['go']);

    this.$get = function () {
      return $stateMock
    }

  });

})();

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

(function () {

  angular
    .module('mocks.ngSecured.pageGuard', [])
    .provider('ngSecured.pageGuard', providerMock);

  function providerMock() {
    this.setupPages = jasmine.createSpy('setupPages');
    this.$get = mockFactory;
  }

  function mockFactory($q) {
    var mock = jasmine.createSpyObj('ngSecured.pageGuard',
      [
        'goToPostLoginPage',
        'goToPostLogoutPage'
      ]);

    return mock;
  };

})();

(function () {

  angular
    .module('mocks.ngSecured.permissionsDao', [])
    .provider('ngSecured.permissionsDao', providerMock);

  function providerMock(){
    this.setup = jasmine.createSpy('setup');
    this.$get = mockFactory;
  }

  function mockFactory($q) {
    var mock = jasmine.createSpyObj('ngSecured.permissionsDao',
      ['getPermissions']);

    mock.$deferred = {
      getPermissions: $q.defer()
    }
    mock.getPermissions.andReturn(mock.$deferred.getPermissions.promise);
    return mock;
  };

})();

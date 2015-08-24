(function(){

angular
  .module('mocks.localStorageService', [])
  .factory('localStorageService', function () {

             var mock = jasmine.createSpyObj('$localStorage',
               ['set',
                'get',
                'remove',
                'clearAll']);

             return mock;
           });
})();
;(function () {

  var uiRouterMockModule = angular.module('mocks.ui.router', []);

  uiRouterMockModule.provider('$state', function () {

    this.state = jasmine.createSpy('$stateProvider.state');

    var $stateMock = jasmine.createSpyObj('$state',['go']);

    this.$get = function () {
      return $stateMock
    }

  });

})();
;(function () {

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
    mock.login.and.returnValue(mock.$deferred.login.promise);
    return mock;
  };

})();
;(function () {

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
;(function () {

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
        'init',
        'goToPostLoginPage',
        'goToPostLogoutPage'
      ]);

    return mock;
  };

})();
;(function () {

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
    mock.getPermissions.and.returnValue(mock.$deferred.getPermissions.promise);
    return mock;
  };

})();

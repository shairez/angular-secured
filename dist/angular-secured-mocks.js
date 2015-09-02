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
;(function(){

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
    .module('mocks.ngSecured.permissionsDao', [])
    .provider('ngSecured.permissionsDao', providerMock);

  function providerMock(){
    this.setup = jasmine.createSpy('setup');
    this.$get = mockFactory;
  }

  function mockFactory($q) {
    var mock = jasmine.createSpyObj('ngSecured.permissionsDao',
      ['find',
       'clear']);

    mock.$deferred = {
      find: $q.defer()
    }
    mock.find.and.returnValue(mock.$deferred.find.promise);
    return mock;
  };

})();
;(function(){
    angular
      .module('mocks.ngSecured.securityContext',
      ['mocks.ngSecured.permissionsDao'])
      .factory('ngSecured.securityContext', srv);

  srv.$inject = ['ngSecured.permissionsDao'];
  function srv(permissionsDaoMock){
    var mockFactory;

    var securityGuardMock = jasmine.createSpyObj('ngSecured.securityGuard', [
      'allow',
      'deny'
    ]);

    mockFactory = function(toParams){
      return {
        permissionsDao: permissionsDaoMock,
        toParams: toParams || {},
        guard: securityGuardMock
      }
    }

    return mockFactory;
  }
})();
;(function () {

  angular
    .module('mocks.ngSecured.securityEnforcer', [])
    .provider('ngSecured.securityEnforcer', providerMock);

  function providerMock() {
    this.setupPages = jasmine.createSpy('setupPages');
    this.$get = mockFactory;
  }

  function mockFactory($q) {
    var mock = jasmine.createSpyObj('ngSecured.securityEnforcer',
      [
        'init',
        'goToPostLoginPage',
        'goToPostLogoutPage'
      ]);

    return mock;
  };

})();

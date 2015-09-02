(function () {

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

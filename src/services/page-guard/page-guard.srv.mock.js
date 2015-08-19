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

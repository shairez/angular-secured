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
    mock.getPermissions.and.returnValue(mock.$deferred.getPermissions.promise);
    return mock;
  };

})();

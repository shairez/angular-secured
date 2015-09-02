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
      ['find',
       'clear']);

    mock.$deferred = {
      find: $q.defer()
    }
    mock.find.and.returnValue(mock.$deferred.find.promise);
    return mock;
  };

})();

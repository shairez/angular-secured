(function(){
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

describe("permissionsDao", function () {

  var permissionsDao,
    permissionsDaoProvider,
    $rootScope,
    $httpBackend,
    cacheKeys,
    localStorageService,
    permissionsConfig,
    fakePermissions,
    fakePermissionUrl;

  beforeEach(module("ngSecured",
                    "mocks.localStorageService",
                    providersSetter));

  providersSetter.$inject = [
    'ngSecured.permissionsDaoProvider'
  ];
  function providersSetter(_permissionsDaoProvider) {
    permissionsDaoProvider = _permissionsDaoProvider;
  }

  beforeEach(inject([
    'ngSecured.permissionsDao',
    '$rootScope',
    'ngSecured.cacheKeys',
    'localStorageService',
    '$httpBackend',
    function (_permissionsDao,
              _$rootScope,
              _cacheKeys,
              _localStorageService,
              _$httpBackend) {
      permissionsDao = _permissionsDao;
      $rootScope = _$rootScope;
      cacheKeys = _cacheKeys;
      localStorageService = _localStorageService;
      $httpBackend = _$httpBackend;
    }]));


  beforeEach(function(){
    fakePermissionUrl = '/permissions';
    fakePermissions = ['permissions1', 'permissions2'];
  });


  describe('METHOD: getPermissions', function () {
    var returnedPermissions,
      refresh;

    Given(function(){
      permissionsConfig = {
        permissionsUrl: fakePermissionUrl
      }
      permissionsDaoProvider.setup(permissionsConfig);
    });

    describe('should return permissions from http and save to cache', function () {
      Given(function(){
        $httpBackend.expectGET(fakePermissionUrl).respond(fakePermissions);
      });
      When(function(){
        permissionsDao.getPermissions().then(function success(response){
          returnedPermissions = response;
        });
        $httpBackend.flush();
      });

      Then(function(){
        expect(localStorageService.set).toHaveBeenCalledWith(cacheKeys.PERMISSIONS, returnedPermissions);
        expect(returnedPermissions).toEqual(fakePermissions);
      });
    });

    describe('should get from cache the second call', function () {
      Given(function(){
        $httpBackend.whenGET(fakePermissionUrl).respond(fakePermissions);

      });
      When(function(){
        permissionsDao.getPermissions(refresh);
        $httpBackend.flush();
        permissionsDao.getPermissions(refresh).then(function success(response){
          returnedPermissions = response;
        });
        $rootScope.$apply();
      });
      Then(function(){
        expect(localStorageService.get).toHaveBeenCalledWith(cacheKeys.PERMISSIONS);
        expect(returnedPermissions).toEqual(fakePermissions);
      });

      describe('when refresh is true, call the server again', function () {
        Given(function(){
          refresh = true;
        });
        Then(function(){
          expect(localStorageService.get).not.toHaveBeenCalledWith(cacheKeys.PERMISSIONS);
        });

      });
    });
  });

});

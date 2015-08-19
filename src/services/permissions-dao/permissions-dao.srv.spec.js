describe("permissionsDao", function () {

  var permissionsDao,
    permissionsDaoProvider,
    $rootScope,
    $httpBackend,
    cacheKeys,
    CacheFactory,
    permissionsConfig,
    fakePermissions,
    fakePermissionUrl,
    permissionsCache;

  beforeEach(module("ngSecured",
                    "mocks.CacheFactory",
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
    'CacheFactory',
    '$httpBackend',
    function (_permissionsDao,
              _$rootScope,
              _cacheKeys,
              _CacheFactory,
              _$httpBackend) {
      permissionsDao = _permissionsDao;
      $rootScope = _$rootScope;
      cacheKeys = _cacheKeys;
      CacheFactory = _CacheFactory;
      $httpBackend = _$httpBackend;
    }]));


  beforeEach(function(){
    fakePermissionUrl = '/permissions';
    fakePermissions = ['permissions1', 'permissions2'];

    permissionsCache = CacheFactory();
    CacheFactory.get.andCallFake(function(cacheKey){
      if (cacheKey === cacheKeys.PERMISSIONS_CACHE){
        return permissionsCache;
      }
    })

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
        expect(permissionsCache.put).toHaveBeenCalledWith(cacheKeys.PERMISSIONS, returnedPermissions);
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
        expect(permissionsCache.get).toHaveBeenCalledWith(cacheKeys.PERMISSIONS);
        expect(returnedPermissions).toEqual(fakePermissions);
      });

      describe('when refresh is true, call the server again', function () {
        Given(function(){
          refresh = true;
        });
        Then(function(){
          expect(permissionsCache.get).not.toHaveBeenCalledWith(cacheKeys.PERMISSIONS);
        });

      });
    });
  });

});

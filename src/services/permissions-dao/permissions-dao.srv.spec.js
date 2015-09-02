describe("permissionsDao", function () {

  var permissionsDao,
    permissionsDaoProvider,
    $rootScope,
    $httpBackend,
    cacheKeys,
    $log,
    errorMessages,
    localStorageService,
    permissionsConfig,
    fakePermissions,
    fakePermissionUrl;

  beforeEach(module("ngSecured.services",
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
    '$log',
    'ngSecured.errorMessages',
    '$httpBackend',
    function (_permissionsDao,
              _$rootScope,
              _cacheKeys,
              _localStorageService,
              _$log,
              _errorMessages,
              _$httpBackend) {
      permissionsDao = _permissionsDao;
      $rootScope = _$rootScope;
      cacheKeys = _cacheKeys;
      localStorageService = _localStorageService;
      $log = _$log;
      errorMessages = _errorMessages;
      $httpBackend = _$httpBackend;
    }]));


  beforeEach(function () {
    fakePermissionUrl = '/permissions';
    fakePermissions = ['permissions1', 'permissions2'];
  });


  describe('METHOD: find', function () {
    var returnedPermissions,
      errorResponse,
      refresh;

    describe('If permissions Url is not configured', function () {
      var returnedError;
      Given(function () {
        permissionsConfig = {};

      });
      When(function () {
        permissionsDao.find().catch(function (error) {
          returnedError = error;
        });
        $rootScope.$apply();
      });
      Then(function () {
        expect(returnedError).toBe(errorMessages.NO_PERMISSIONS_URL);
      });
    });

    describe('if url is set', function () {
      Given(function () {
        permissionsConfig = {
          url: fakePermissionUrl
        }
      });
      When(function () {
        permissionsDaoProvider.setup(permissionsConfig);
      });

      describe('should return permissions from http and save to cache', function () {

        When(function () {
          permissionsDao.find()
            .then(function success(response) {
                    returnedPermissions = response;
                  })
            .catch(function error(response) {
                     errorResponse = response;
                   });
          $httpBackend.flush();
        });

        describe('if permissionsJsonPath is not configured', function () {
          Given(function () {
            $httpBackend.expectGET(fakePermissionUrl).respond(fakePermissions);
          });
          Then(function () {
            expect(localStorageService.set).toHaveBeenCalledWith(cacheKeys.PERMISSIONS, returnedPermissions);
            expect(returnedPermissions).toEqual(fakePermissions);
          });
        });

        describe('if permissionsJsonPath is configured correct', function () {
          Given(function () {
            permissionsConfig.permissionsJsonPath = 'insidePermissions';
            $httpBackend.expectGET(fakePermissionUrl).respond({insidePermissions: fakePermissions});
          });
          Then(function () {
            expect(returnedPermissions).toEqual(fakePermissions);
          });
        });

        describe('if permissionsJsonPath is wrong path', function () {
          Given(function () {
            $log.reset();
            permissionsConfig.permissionsJsonPath = 'wrongPath';
            $httpBackend.expectGET(fakePermissionUrl).respond({insidePermissions: fakePermissions});
          });
          Then(function () {
            expect($log.error.logs.length).toBe(1);
            expect(errorResponse).toBeDefined();
          });
        });


      });

      describe('should get from cache the second call', function () {
        Given(function () {
          $httpBackend.whenGET(fakePermissionUrl).respond(fakePermissions);

        });
        When(function () {
          permissionsDao.find(refresh);
          $httpBackend.flush();
          permissionsDao.find(refresh).then(function success(response) {
            returnedPermissions = response;
          });
          $rootScope.$apply();
        });
        Then(function () {
          expect(localStorageService.get).toHaveBeenCalledWith(cacheKeys.PERMISSIONS);
          expect(returnedPermissions).toEqual(fakePermissions);
        });

        describe('when refresh is true, call the server again', function () {
          Given(function () {
            refresh = true;
          });
          Then(function () {
            expect(localStorageService.get).not.toHaveBeenCalledWith(cacheKeys.PERMISSIONS);
          });

        });
      });

    });


  });

  describe('METHOD: clear', function () {
    When(function(){
      permissionsDao.clear();
    });
    Then(function(){
      expect(localStorageService.remove).toHaveBeenCalledWith(cacheKeys.PERMISSIONS);
    });
  });

});

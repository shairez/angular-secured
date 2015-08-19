xdescribe("loginManager", function () {

  var loginManager,
    httpManagerProvider,
    $state,
    $rootScope,
    $stateProvider,
    $httpBackend,
    defaultStateNames,
    cacheKeys,
    CacheFactory;

  beforeEach(module("ngSecured",
                    "mocks.CacheFactory",
                    providersSetter));
  providersSetter.$inject = [
    'ngSecured.httpManagerProvider',
    '$stateProvider'
  ];

  function providersSetter(_httpManagerProvider, _$stateProvider) {
    $stateProvider = _$stateProvider;
    httpManagerProvider = _httpManagerProvider;
  }


  beforeEach(inject([
    'ngSecured.loginDao',
    '$state',
    '$rootScope',
    'ngSecured.defaultStateNames',
    'ngSecured.cacheKeys',
    'CacheFactory',
    '$httpBackend',
    '$http',
    function (_loginManager,
              _$state,
              _$rootScope,
              _defaultStateNames,
              _cacheKeys,
              _CacheFactory,
              _$httpBackend) {
      $state = _$state;
      $rootScope = _$rootScope;
      defaultStateNames = _defaultStateNames;
      cacheKeys = _cacheKeys;
      CacheFactory = _CacheFactory;
      $httpBackend = _$httpBackend;
      loginManager = _loginManager;
    }]));

  describe('METHODS', function () {

    Given(function () {
    });

    describe('METHOD: setup', function () {
      var credentials;
      var loginUrl;
      var loginConfig;
      var cacheExpiresIn;
      var loginPromise;
      var fakeLoginResponse;

      Given(function () {

        httpManagerProvider.setupPages();

        credentials = {username: 'test', password: 'test'};
        loginUrl = '/users/login';
        fakeLoginResponse = {
          id: fakeToken,
          ttl: cacheExpiresIn
        };

        cacheExpiresIn = 1209600;
        loginConfig = {
          loginUrl: loginUrl
        }
      });

      When(function () {

      });


    });

  });
});

// make further requests with the token in header
//$httpBackend.expectPOST(loginUrl, credentials, function(headers){
//  return headers['Authorization'] == 'test';
//})

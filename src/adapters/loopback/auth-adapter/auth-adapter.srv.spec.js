describe("loopback authAdapter", function () {

  var loopbackAdapter,
    loopbackAdapterProvider,
    $rootScope,
    $log,
    $httpBackend,
    cacheKeys,
    localStorageService,
    fakeToken,
    fakeMaxAge,
    adapterConfig,
    defaultMaxAge;

  beforeEach(module('ngSecured.loopback',
                    'mocks.localStorageService',
                    providersSetter));

  providersSetter.$inject = [
    'ngSecured.authAdapterProvider'
  ];
  function providersSetter(_authAdapterProvider) {
    loopbackAdapterProvider = _authAdapterProvider;
  }

  beforeEach(inject([
    'ngSecured.authAdapter',
    '$rootScope',
    '$log',
    'ngSecured.defaultStateNames',
    'ngSecured.cacheKeys',
    'localStorageService',
    '$httpBackend',
    '$http',
    function (_authAdapter,
              _$rootScope,
              _$log,
              _defaultStateNames,
              _cacheKeys,
              _localStorageService,
              _$httpBackend) {
      $rootScope = _$rootScope;
      $log = _$log;
      cacheKeys = _cacheKeys;
      localStorageService = _localStorageService;
      $httpBackend = _$httpBackend;
      loopbackAdapter = _authAdapter;
    }]));

  beforeEach(function () {
    defaultMaxAge = 60 * 60 * 1000;
    fakeToken = 'TOKENTOKENTOKEN';
    fakeMaxAge = 320000403;

  });


  describe('METHOD: Login', function () {
    var credentials;
    var loginUrl;

    var cacheExpiresIn;
    var loginPromise;
    var fakeLoginResponse;

    Given(function () {
      credentials = {username: 'test', password: 'test'};
      loginUrl = '/users/login';
      fakeLoginResponse = {
        id: fakeToken,
        ttl: cacheExpiresIn
      };

      cacheExpiresIn = 1209600;
      adapterConfig = {
        loginUrl: loginUrl
      }
    });

    When(function () {
      loopbackAdapterProvider.setup(adapterConfig);
      loginPromise = loopbackAdapter.login(credentials);
    });

    describe('Should post to the right url with the user credentials', function () {
      Given(function () {
        $httpBackend.expectPOST(loginUrl, credentials).respond(fakeLoginResponse);
      });
      Then(function () {
        $httpBackend.flush();
      });
    });

    describe('Should cache response token', function () {
      Given(function () {
        adapterConfig.tokenAgeJsonPath = 'ttl';
        adapterConfig.tokenJsonPath = 'id';

        $httpBackend.whenPOST(loginUrl, credentials).respond({
          id: fakeToken,
          ttl: cacheExpiresIn
        });
      });
      When(function () {
        $httpBackend.flush();
      });

      Then(function () {
        expect(localStorageService.set).toHaveBeenCalledWith(cacheKeys.TOKEN, fakeToken);
      });

      describe('should reject the promise if cant find token', function () {
        var errorRespone;
        Given(function () {
          adapterConfig.tokenJsonPath = 'wrong.token';
          $log.reset();
        });
        When(function () {
          loginPromise.catch(function (error) {
            errorRespone = error;
          });
          $rootScope.$apply();
        });
        Then(function () {
          expect($log.error.logs.length).toBe(1);
          expect(errorRespone instanceof Error).toBeTruthy();
        });
      });

      describe('should return the http response data object', function () {
        var loginData;
        When(function () {
          loginPromise.then(function (data) {
            loginData = data;
          });
          $rootScope.$apply();
        });
        Then(function () {
          expect(loginData).toEqual(fakeLoginResponse);
        });
      });

    });
  });

  describe('METHOD: isLoggedIn', function () {

    var loggedIn;

    When(function () {
      loggedIn = loopbackAdapter.isLoggedIn()
    });

    describe('When no token in cache, return false', function () {
      Then(function () {
        expect(loggedIn).toBeFalsy();
      });
    });

    describe('When token is in cache, return true', function () {
      Given(function () {
        localStorageService.get.and.callFake(function (cacheKey) {
          if (cacheKey === cacheKeys.TOKEN) {
            return fakeToken;
          }
        })
      });
      Then(function () {
        expect(loggedIn).toBeTruthy();
      });
    });
  });

  describe('METHOD: logout', function () {

    describe('should call logoutUrl if defined with the token and delete the token from memory and cache', function () {
      var logoutUrl;
      Given(function () {

        logoutUrl = '/logout';
        adapterConfig = {
          logoutUrl: logoutUrl
        };

        $httpBackend.expectPOST(logoutUrl, null, function(headers){
          return headers['Authorization'] == fakeToken;
        }).respond(true);

        loopbackAdapter.setToken(fakeToken);
        loopbackAdapterProvider.setup(adapterConfig);

      });

      When(function () {
        loopbackAdapter.logout();
      });

      Then(function () {
        $httpBackend.flush();
        expect(localStorageService.remove).toHaveBeenCalledWith(cacheKeys.TOKEN);
        expect(loopbackAdapter.getToken()).toBeUndefined();
      });
    });
  });

  describe('METHOD: setToken', function () {
    var passedMaxAge;

    When(function () {
      loopbackAdapter.setToken(fakeToken, passedMaxAge);
    });

    describe('Should cache the token with the passed maxAge', function () {
      Given(function () {
        passedMaxAge = fakeMaxAge;
      });
      Then(function () {
        expect(localStorageService.set).toHaveBeenCalledWith(cacheKeys.TOKEN, fakeToken);
      });
    });

  });

  describe('METHOD: getToken', function () {
    var returnedToken;

    When(function () {
      returnedToken = loopbackAdapter.getToken();
    });

    describe('should return cached token when no in memory token', function () {
      Given(function () {
        localStorageService.get.and.callFake(function (cacheKey) {
          if (cacheKey === cacheKeys.TOKEN) {
            return fakeToken;
          }
        })
      });
      Then(function () {
        expect(returnedToken).toBe(fakeToken);
      });
    });
    describe('Should return in-memory token and not from cache when available', function () {
      Given(function () {
        localStorageService.get.calls.reset();
        loopbackAdapter.setToken(fakeToken);
      });
      Then(function () {
        expect(localStorageService.get).not.toHaveBeenCalled();
      });
    });


  });
});


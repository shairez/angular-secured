describe("loginDao", function () {

  var loginDao,
    loginDaoProvider,
    $rootScope,
    $log,
    $httpBackend,
    cacheKeys,
    localStorageService,
    fakeToken,
    fakeMaxAge,
    defaultMaxAge;

  beforeEach(module('ngSecured',
                    'mocks.localStorageService',
                    providersSetter));

  providersSetter.$inject = [
    'ngSecured.loginDaoProvider'
  ];
  function providersSetter(_loginDaoProvider) {
    loginDaoProvider = _loginDaoProvider;
  }

  beforeEach(inject([
    'ngSecured.loginDao',
    '$rootScope',
    '$log',
    'ngSecured.defaultStateNames',
    'ngSecured.cacheKeys',
    'localStorageService',
    '$httpBackend',
    '$http',
    function (_loginDao,
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
      loginDao = _loginDao;
    }]));

  beforeEach(function () {
    defaultMaxAge = 60 * 60 * 1000;
    fakeToken = 'TOKENTOKENTOKEN';
    fakeMaxAge = 320000403;

  });

  describe('METHOD: Login', function () {
    var credentials;
    var loginUrl;
    var loginConfig;
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
      loginConfig = {
        loginUrl: loginUrl
      }
    });

    When(function () {
      loginDaoProvider.setup(loginConfig);
      loginPromise = loginDao.login(credentials);
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
        loginConfig.tokenAgeJsonPath = 'ttl';
        loginConfig.tokenJsonPath = 'id';

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
          loginConfig.tokenJsonPath = 'wrong.token';
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
      loggedIn = loginDao.isLoggedIn()
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

    When(function () {
      loginDao.logout();
    });

    describe('should delete token from cache', function () {
      Then(function () {
        expect(localStorageService.remove).toHaveBeenCalledWith(cacheKeys.TOKEN);
        expect(loginDao.getToken()).toBeUndefined();
      });
    });

    describe('should delete token from memory', function () {
      Given(function () {
        loginDao.setToken(123);
      });
      Then(function () {
        expect(loginDao.getToken()).toBeUndefined();
      });
    });
  });

  describe('METHOD: setToken', function () {
    var passedMaxAge;

    When(function () {
      loginDao.setToken(fakeToken, passedMaxAge);
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
      returnedToken = loginDao.getToken();
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
        loginDao.setToken(fakeToken);
      });
      Then(function () {
        expect(localStorageService.get).not.toHaveBeenCalled();
      });
    });


  });
});

// make further requests with the token in header
//$httpBackend.expectPOST(loginUrl, credentials, function(headers){
//  return headers['Authorization'] == 'test';
//})

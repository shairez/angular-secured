describe("ngSecured", function () {

  var ngSecured,
    ngSecuredProvider,
    $state,
    $rootScope,
    $stateProvider,
    $q,
    $http,
    $httpBackend,
    defaultStateNames,
    cacheOptions,
    loginDaoMock,
    pageGuardMock;


  beforeEach(module('ngSecured',
                    'mocks.ngSecured.pageGuard',
                    'mocks.ngSecured.loginDao',
                    providersSetter));

  providersSetter.$inject = [
    'ngSecuredProvider'
  ];
  function providersSetter(_ngSecuredProvider) {
    ngSecuredProvider = _ngSecuredProvider;
  }


  beforeEach(inject(['ngSecured',
                     '$state',
                     '$rootScope',
                     '$q',
                     'ngSecured.defaultStateNames',
                     'ngSecured.cacheOptions',
                     '$httpBackend',
                     '$http',
                     'ngSecured.loginDao',
                     'ngSecured.pageGuard',
                     function (_ngSecured,
                               _$state,
                               _$rootScope,
                               _$q,
                               _defaultStateNames,
                               _cacheOptions,
                               _$httpBackend,
                               _$http,
                               _loginDao,
                               _pageGuard) {
                       ngSecured = _ngSecured;
                       $state = _$state;
                       $rootScope = _$rootScope;
                       $q = _$q;
                       defaultStateNames = _defaultStateNames;
                       cacheOptions = _cacheOptions;
                       $httpBackend = _$httpBackend;
                       $http = _$http;
                       loginDaoMock = _loginDao;
                       pageGuardMock = _pageGuard;
                     }]));


  describe('METHOD: login', function () {
    var credentials,
      returnedResponse;

    Given(function () {
      credentials = {
        username: 'user',
        password: '1234'
      }

      loginDaoMock.$deferred.login.resolve(true);
    });

    When(function () {
      ngSecured
        .login(credentials)
        .then(
        function success(response) {
          returnedResponse = response;
        });
      $rootScope.$apply();
    });
    Then(function () {
      expect(loginDaoMock.login).toHaveBeenCalledWith(credentials);
      expect(pageGuardMock.goToPostLoginPage).toHaveBeenCalled();
    });
  });

  describe('METHOD: logout', function () {
    When(function(){
      ngSecured.logout();
    });
    Then(function(){
      expect(loginDaoMock.logout).toHaveBeenCalled();
      expect(pageGuardMock.goToPostLogoutPage).toHaveBeenCalled();
    });
  });

  describe('METHOD: isLoggedIn', function () {
    Given(function(){
      loginDaoMock.isLoggedIn.and.returnValue(true);
    });
    When(function(){
      loggedIn = ngSecured.isLoggedIn();
    });
    Then(function(){
      expect(loggedIn).toBe(true);
    });
  });

  xdescribe("should relogin On error Http Status", function () {
    function configureLoginState() {
      ngSecuredProvider.secure({
        loginState: loginStateName
      });
      $stateProvider.state(loginStateName, {});
    }

    function configureNormalState(state) {
      if (!state) state = {};
      $stateProvider.state(stateName, state);
    }


    Given(function () {
      configureLoginState();
      configureNormalState({url: "/:sectionId"});
      $httpBackend.whenGET("/noAuth").respond(403);
      $rootScope.$apply(function () {
        $state.go(stateName, stateParams);
      })
    });

    When(function () {
      $http.get("/noAuth");
      $httpBackend.flush();
    });

    describe("and status is a number", function () {
      Given(function () {
        ngSecuredProvider.secure({
          reloginOnHttpStatus: 403
        })
      });

      Then(function () {
        expect($state.current.name).toBe(loginStateName)
      });

      describe("should save last state", function () {
        Given(function () {
          ngSecuredProvider.secure({
            isAuthenticated: function () {
              return true;
            },
            login: function () {
              return "admin";
            }
          })
        });
        When(function () {
          ngSecured.loggingIn();
          $rootScope.$apply();
        });
        Then(function () {
          expect($state.current.name).toBe(stateName);
          expect($state.params).toEqual(stateParams);
        });
      });
    });

    describe("and status is array", function () {
      Given(function () {
        ngSecuredProvider.secure({
          reloginOnHttpStatus: [403, 404]
        })
        $httpBackend.whenGET("/noAuth2").respond(404);
      });
      Then(function () {
        expect($state.current.name).toBe(loginStateName);
        $rootScope.$apply(function () {
          $state.go(stateName)
        });
        $http.get("/noAuth2");
        $httpBackend.flush();
        expect($state.current.name).toBe(loginStateName);
      });
    });


  });

});

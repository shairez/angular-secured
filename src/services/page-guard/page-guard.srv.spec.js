describe("pageGuard", function () {

  var pageGuard,
    pageGuardProvider,
    $state,
    $rootScope,
    $q,
    $log,
    $stateProvider,
    $httpBackend,
    $controllerProvider,
    permissionsDaoMock,
    defaultStateNames,
    cacheKeys,
    loginDaoMock,
    fakeToState,
    fakeToParams,
    fakeFromState,
    fakeFromParams,
    fakePagesConfig,
    DEFAULT_FULLPAGE_STATE_NAME,
    FAKE_TOSTATE_NAME,
    FAKE_FROMSTATE_NAME,
    FAKE_FULLPAGE_LOGIN_STATE_NAME,
    FAKE_POPUP_LOGIN_STATE_NAME,
    FAKE_POST_LOGIN_STATE_NAME,
    FAKE_POST_LOGOUT_STATE_NAME,
    FAKE_UNAUTHORIZED_STATE_NAME;

  beforeEach(module("ngSecured",
                    'mocks.ui.router',
                    'mocks.ngSecured.loginDao',
                    'mocks.ngSecured.permissionsDao',
                    providersSetter));

  providersSetter.$inject = [
    'ngSecured.pageGuardProvider',
    '$stateProvider',
    '$controllerProvider'
  ];
  function providersSetter(_pageGuardProvider,
                           _$stateProvider,
                           _$controllerProvider) {
    pageGuardProvider = _pageGuardProvider;
    $stateProvider = _$stateProvider;
    $controllerProvider = _$controllerProvider;
  }


  beforeEach(inject([
    'ngSecured.pageGuard',
    '$state',
    '$q',
    '$log',
    '$rootScope',
    'ngSecured.defaultStateNames',
    'ngSecured.cacheKeys',
    '$httpBackend',
    '$http',
    'ngSecured.loginDao',
    'ngSecured.permissionsDao',
    function (_routeSecurityGuard,
              _$state,
              _$q,
              _$log,
              _$rootScope,
              _defaultStateNames,
              _cacheKeys,
              _$httpBackend,
              $http,
              loginDao,
              permissionsDao) {

      pageGuard = _routeSecurityGuard;
      $state = _$state;
      $q = _$q;
      $log = _$log;
      $rootScope = _$rootScope;
      defaultStateNames = _defaultStateNames;
      cacheKeys = _cacheKeys;
      $httpBackend = _$httpBackend;
      loginDaoMock = loginDao;
      permissionsDaoMock = permissionsDao;

    }]));


  beforeEach(function () {
    DEFAULT_FULLPAGE_STATE_NAME = defaultStateNames.LOGIN;
    FAKE_FULLPAGE_LOGIN_STATE_NAME = 'loginState';
    FAKE_POPUP_LOGIN_STATE_NAME = 'popupLoginState';
    FAKE_TOSTATE_NAME = 'fakeState';
    FAKE_FROMSTATE_NAME = 'fakeFromState';
    FAKE_UNAUTHORIZED_STATE_NAME = 'fakeUnauthorizedState';
    FAKE_POST_LOGIN_STATE_NAME = 'fakePostLoginState';
    FAKE_POST_LOGOUT_STATE_NAME = 'fakePostLogoutState';

    fakeToState = {name: FAKE_TOSTATE_NAME};
    fakeFromState = {name: FAKE_FROMSTATE_NAME};

    fakePagesConfig = {};

  });

  When(function () {
    pageGuardProvider.setupPages(fakePagesConfig);
  });


  describe('METHOD: init', function () {
    Given(function(){
      $log.reset();
    });
    When(function(){
      pageGuard.init();
    });
    Then(function(){
       expect($log.error.logs.length).toBe(4);
    });
  });

  describe('METHOD: _handleStateChange', function () {
    var startEventMock;

    Given(function () {
      startEventMock = jasmine.createSpyObj('startEventMock', ['preventDefault']);
    });

    When(function () {
      pageGuard._handleStateChange(startEventMock,
                                   fakeToState,
                                   fakeToParams,
                                   fakeFromState,
                                   fakeFromParams);
    });

    describe('if state is not secured', function () {
      Then(function () {
        expect(startEventMock.preventDefault).not.toHaveBeenCalled();
      });
    });

    describe('if state is secured', function () {
      var _isRouteApprovedDeferred;

      Given(function mockInnerFunctions() {
        pageGuard._goToLogin = jasmine.createSpy('_goToLogin');
        pageGuard.setLastDeniedStateAndParams = jasmine.createSpy('setLastDeniedStateAndParams');
        pageGuard._isRouteApproved = jasmine.createSpy('routeSecurityGuard._isRouteApproved');
        _isRouteApprovedDeferred = $q.defer();
        pageGuard._isRouteApproved.and.returnValue(_isRouteApprovedDeferred.promise);
      });

      describe('if secured is boolean and true', function () {
        Given(function () {
          fakeToState.data = {secured: true};
        });

        describe('if user is logged in', function () {
          Given(function () {
            loginDaoMock.isLoggedIn.and.returnValue(true);
          });
          Then(function () {
            expect(startEventMock.preventDefault).not.toHaveBeenCalled();
          });
        });

        describe('if user is not logged in', function () {
          Given(function () {
            loginDaoMock.isLoggedIn.and.returnValue(false);
          });
          Then(function () {
            expect(startEventMock.preventDefault).toHaveBeenCalled();
            expect(pageGuard.setLastDeniedStateAndParams).toHaveBeenCalledWith(fakeToState, fakeToParams);
            expect(pageGuard._goToLogin).toHaveBeenCalledWith(FAKE_FROMSTATE_NAME, true);
          });

        });
      });

      describe('if secured is string', function () {
        Given(function () {
          fakeToState.data = {secured: 'fakeSecurityPolicy.ctrl'};
        });


        Then(function () {
          expect(startEventMock.preventDefault).toHaveBeenCalled();
          expect(pageGuard._isRouteApproved).toHaveBeenCalledWith(fakeToState.data.secured);
        });

        describe('if promise result is true', function () {
          When(function () {
            _isRouteApprovedDeferred.resolve({answer: true});
            $rootScope.$apply();
          });

          Then(function () {
            expect($state.go).toHaveBeenCalledWith(fakeToState.name, fakeToParams);
          });
        });

        describe('if promise answer is false', function () {
          var response;
          Given(function () {
            response = {answer: false};
          });
          When(function () {
            _isRouteApprovedDeferred.resolve(response);
            $rootScope.$apply();
          });

          describe('if user is not logged in', function () {
            Given(function () {
              loginDaoMock.isLoggedIn.and.returnValue(false);
            });
            Then(function () {
              expect(pageGuard.setLastDeniedStateAndParams).toHaveBeenCalledWith(fakeToState, fakeToParams);
              expect(pageGuard._goToLogin).toHaveBeenCalledWith(FAKE_FROMSTATE_NAME, true);
            });
          });

          describe('when a requestApprovalState returns', function () {
            describe('when the value is string', function () {
              Given(function () {
                response.requestApprovalState = 'differentLogin';
              });
              Then(function () {
                expect($state.go).toHaveBeenCalledWith(response.requestApprovalState, undefined);
              });
            });

            describe('when the value is object should forward to the right state', function () {

              Given(function () {
                response.requestApprovalState = {
                  name: 'differentLogin',
                  params: {'key1': 'value1'}
                };
              });
              Then(function () {
                var requestApprovalState = response.requestApprovalState;
                expect($state.go).toHaveBeenCalledWith(requestApprovalState.name,
                                                       requestApprovalState.params);
              });


            });

          });

          describe('if user is logged in', function () {
            Given(function () {
              loginDaoMock.isLoggedIn.and.returnValue(true);
              fakePagesConfig.unAuthorized = FAKE_UNAUTHORIZED_STATE_NAME;
            });
            Then(function () {
              expect($state.go).toHaveBeenCalledWith(FAKE_UNAUTHORIZED_STATE_NAME);
            });
          });
        });
      });

    });

  });

  describe('METHODS: setLastDeinedState, getLastDeniedState', function () {
    var lastDeniedState,
      lastDeniedStateParams,
      returnedLastDeniedStateAndParams;
    Given(function () {
      lastDeniedState = {name: FAKE_TOSTATE_NAME};
      lastDeniedStateParams = fakeToParams;
    });
    When(function () {
      pageGuard.setLastDeniedStateAndParams(lastDeniedState, lastDeniedStateParams);
      returnedLastDeniedStateAndParams = pageGuard.getLastDeniedStateAndParams();
    });
    Then(function () {
      expect(returnedLastDeniedStateAndParams).toEqual({
        state: lastDeniedState,
        params: lastDeniedStateParams
      })
    });
  });

  describe('METHOD: _goToLogin', function () {
    var passedFromStateName,
      passedShowPopupLogin;

    When(function () {
      pageGuardProvider.setupPages(fakePagesConfig);

      pageGuard._goToLogin(passedFromStateName, passedShowPopupLogin);
    });

    describe('if this is the first page after refresh', function () {
      Given(function () {
        passedShowPopupLogin = true;
        passedFromStateName = '';
      });

      describe("if fullPageLoginStateName isn't defined", function () {
        Then(function () {
          expect($state.go).toHaveBeenCalledWith(DEFAULT_FULLPAGE_STATE_NAME);
        });
      });

      describe('if fullPageLoginStateName is defined', function () {
        Given(function () {
          fakePagesConfig.login = FAKE_FULLPAGE_LOGIN_STATE_NAME;
        });
        Then(function () {
          expect($state.go).toHaveBeenCalledWith(FAKE_FULLPAGE_LOGIN_STATE_NAME);
        });
      });

    });

    describe('if trying to come from a different state', function () {
      Given(function () {
        passedFromStateName = FAKE_FROMSTATE_NAME;
        fakePagesConfig.login = FAKE_FULLPAGE_LOGIN_STATE_NAME;
        fakePagesConfig.loginPopup = FAKE_POPUP_LOGIN_STATE_NAME;
      });
      describe('if show popup is false', function () {
        Given(function () {
          passedShowPopupLogin = false;
        });
        Then(function () {
          expect($state.go).toHaveBeenCalledWith(FAKE_FULLPAGE_LOGIN_STATE_NAME);
        });
      });
      describe('if show popup is true', function () {
        Given(function () {
          passedShowPopupLogin = true;
        });
        Then(function () {
          expect($state.go).toHaveBeenCalledWith(FAKE_POPUP_LOGIN_STATE_NAME);
        });
      });

    });
  });

  describe('METHOD: _isRouteApproved', function () {
    var securityControllerName,
      guardResponse,
      errorResponse,
      fakePermissions;

    Given(function () {
      fakePermissions = ['permission1', 'permission2'];
      permissionsDaoMock.$deferred.getPermissions.resolve(fakePermissions);
    });

    When(function () {

      pageGuard._isRouteApproved(securityControllerName)
        .then(
        function success(response) {
          guardResponse = response;
        },
        function error(error) {
          errorResponse = error;
        });
      $rootScope.$apply();
    });

    describe('call security controller', function () {

      Given(function () {
        securityControllerName = 'mySecurityController';
      });

      describe('should pass permissions in context', function () {
        var passedPermissions;
        Given(function () {
          $controllerProvider.register(securityControllerName, ctrl);
          function ctrl(securityContext) {
            passedPermissions = securityContext.permissions;
          }
        });
        Then(function () {
          expect(passedPermissions).toEqual(fakePermissions);
        });
      });

      describe('when guard allows', function () {
        Given(function () {
          $controllerProvider.register(securityControllerName, ctrl);
          function ctrl(securityContext) {
            securityContext.guard.allow();
          }
        });

        Then(function () {
          expect(guardResponse).toBeDefined();
          expect(guardResponse.answer).toBeTruthy();
        });
      });

      describe('when guard denies with a different login state', function () {
        var requestApprovalState;
        Given(function () {
          requestApprovalState = {name: 'differentState', params: {}};

          $controllerProvider.register(securityControllerName, ctrl);
          function ctrl(securityContext) {
            securityContext.guard.deny(requestApprovalState);
          }
        });
        Then(function () {
          expect(guardResponse).toBeDefined();
          expect(guardResponse.answer).toBeFalsy();
          expect(guardResponse.requestApprovalState).toBe(requestApprovalState);

        });
      });

    });

  });

  describe('METHOD: goToPostLoginPage', function () {
    When(function () {
      pageGuard.goToPostLoginPage();
    });
    describe('when lastDeniedState is stored', function () {
      Given(function () {
        pageGuard.setLastDeniedStateAndParams(fakeToState, fakeToParams);
      });
      Then(function () {
        expect($state.go).toHaveBeenCalledWith(FAKE_TOSTATE_NAME, fakeToParams);
      });
    });

    describe('when lastDeniedState is not stored', function () {
      Given(function () {
        fakePagesConfig.postLogin = FAKE_POST_LOGIN_STATE_NAME;
      });
      Then(function () {
        expect($state.go).toHaveBeenCalledWith(FAKE_POST_LOGIN_STATE_NAME);
      });
    });

  });

  describe('METHOD: goToPostLogoutPage', function () {
    Given(function(){
      fakePagesConfig.postLogout = FAKE_POST_LOGOUT_STATE_NAME;
    });
    When(function () {
      pageGuard.goToPostLogoutPage();
    });

    describe('if page is secured, go to post logout', function () {
      Given(function () {
        $state.current = {
          data: {
            secured: true
          }
        }
        fakePagesConfig.postLogout = FAKE_POST_LOGOUT_STATE_NAME;
      });
      Then(function () {
        expect($state.go).toHaveBeenCalledWith(FAKE_POST_LOGOUT_STATE_NAME);
      });
    });

    describe('if page is not secured, stay in the same page', function () {
      Given(function(){
        $state.current = {
        }
      });
      Then(function () {
        expect($state.go).not.toHaveBeenCalled();
      });
    });

    describe('if page is login, go to post logout', function () {
      Given(function(){
        fakePagesConfig.login = FAKE_FULLPAGE_LOGIN_STATE_NAME;
        $state.current = {
          name: FAKE_FULLPAGE_LOGIN_STATE_NAME
        }
      });
      Then(function () {
        expect($state.go).toHaveBeenCalledWith(FAKE_POST_LOGOUT_STATE_NAME);
      });
    });
  });

});

// make further requests with the token in header
//$httpBackend.expectPOST(loginUrl, credentials, function(headers){
//  return headers['Authorization'] == 'test';
//})

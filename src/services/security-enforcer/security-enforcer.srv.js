(function () {

  angular
    .module("ngSecured.services")
    .provider('ngSecured.securityEnforcer', provider);

  provider.$inject = [
    '$stateProvider',
    'ngSecured.defaultStateNames'
  ];

  function provider($stateProvider,
    defaultStateNames) {

    var pages = {
      login: defaultStateNames.LOGIN,
      postLogin: defaultStateNames.POST_LOGIN,
      postLogout: defaultStateNames.POST_LOGOUT,
      unAuthorized: defaultStateNames.NOT_AUTHORIZED
    };

    (function configureDefaultStates() {

      $stateProvider.state(defaultStateNames.BASE_STATE, {});
      $stateProvider.state(defaultStateNames.NOT_AUTHENTICATED, {
        views: {
          "@": {
            template: "please login to see this page."
          }
        }
      });
      $stateProvider.state(defaultStateNames.NOT_AUTHORIZED, {
        views: {
          "@": {
            template: "You are not .authorized to see this page."
          }
        }
      });
      $stateProvider.state(defaultStateNames.LOGIN, {
        views: {
          '@': {
            template: 'Please configure a login state'
          }
        }
      });
      $stateProvider.state(defaultStateNames.POST_LOGIN, {
        views: {
          '@': {
            template: 'Please configure a post logout state'
          }
        }
      });
      $stateProvider.state(defaultStateNames.POST_LOGOUT, {
        views: {
          '@': {
            template: 'Please configure a post login state'
          }
        }
      });
    })();


    this.setupPages = setupPages;
    this.$get = factory;

    function setupPages(config) {
      angular.extend(pages, config);
    }


    factory.$inject = [
      '$rootScope',
      '$q',
      '$parse',
      '$log',
      '$controller',
      '$state',
      'localStorageService',
      'ngSecured.cacheKeys',
      'ngSecured.authAdapter',
      'ngSecured.permissionsDao'
    ];

    function factory($rootScope,
      $q,
      $parse,
      $log,
      $controller,
      $state,
      localStorageService,
      cacheKeys,
      authAdapter,
      permissionsDao) {

      var lastDeniedStateAndParams,
        skipNextSecurityCheck;

      var enforcer = {};
      enforcer.init = init;
      enforcer.goToPostLoginPage = goToPostLoginPage;
      enforcer.goToPostLogoutPage = goToPostLogoutPage;
      enforcer.setLastDeniedStateAndParams = setLastDeniedStateAndParams;
      enforcer.getLastDeniedStateAndParams = getLastDeniedStateAndParams;

      // Private methods for testing, you should not use them directly
      enforcer._handleStateChange = _handlePageChange;
      enforcer._goToLogin = _goToLogin;
      enforcer._isPageApproved = _isPageApproved;

      return enforcer;

      function init() {
        setupListeners();
        showWarnings();
      }

      function showWarnings() {
        if (pages.login === defaultStateNames.LOGIN) {
          warnAboutState('Login');
        }
        if (pages.unAuthorized === defaultStateNames.NOT_AUTHORIZED) {
          warnAboutState('unAuthorized');
        }
        if (pages.postLogin === defaultStateNames.POST_LOGIN) {
          warnAboutState('postLogin');
        }
        if (pages.postLogout === defaultStateNames.POST_LOGOUT) {
          warnAboutState('postLogout');
        }

        function warnAboutState(stateType) {
          $log.error('In ngSecuredProvider.secure, you need to set the page name of "' + stateType + '"');
        }
      }

      function setupListeners() {
        $rootScope.$on('$stateChangeStart', enforcer._handleStateChange);
      }

      function _handlePageChange(event, toState, toParams, fromState, fromParams) {
        var secured,
          securityControllerName;

        if (!skipNextSecurityCheck) {

          if (toState.data) {
            secured = toState.data.secured;
          }
          if (secured) {

            if (secured === true && !authAdapter.isLoggedIn()) {
              event.preventDefault();
              enforcer.setLastDeniedStateAndParams(toState, toParams);
              enforcer._goToLogin();
            }

            if (angular.isString(secured)) {
              securityControllerName = secured;
              event.preventDefault();
              invokeSecurityController(securityControllerName);
            }
          }
        } else {
          skipNextSecurityCheck = false;
        }

        function invokeSecurityController(securityCtrlName) {
          enforcer
            ._isPageApproved(securityCtrlName, toParams)
            .then(promiseSuccess)
            .catch(promiseError);

          function promiseSuccess(response) {
            var stateName,
              params,
              requestApprovalState = response.requestApprovalState;

            if (response.answer === true) {
              skipNextSecurityCheck = true;
              $state.go(toState.name, toParams);

            } else if (requestApprovalState) {

              if (angular.isString(requestApprovalState)) {
                stateName = requestApprovalState;
              } else if (angular.isObject(requestApprovalState)) {
                stateName = requestApprovalState.name;
                params = requestApprovalState.params;
              }

              if (stateName) {
                $state.go(stateName, params);
              } else {
                throw new Error('requestApprovalState must have a "name" property');
              }

            } else if (authAdapter.isLoggedIn()) {
              $state.go(pages.unAuthorized);
            } else {
              enforcer.setLastDeniedStateAndParams(toState, toParams);
              enforcer._goToLogin();
            }

          }

          function promiseError(errResponse) {
            $log.error(errResponse);
          }
        }

      }

      function setLastDeniedStateAndParams(state, params) {
        lastDeniedStateAndParams = {
          state: state,
          params: params
        };
        localStorageService.set(cacheKeys.LAST_STATE, lastDeniedStateAndParams);
      }

      function getLastDeniedStateAndParams() {
        if (!lastDeniedStateAndParams) {
          lastDeniedStateAndParams = localStorageService.get(cacheKeys.LAST_STATE);
        }
        return lastDeniedStateAndParams;
      }

      function removeLastDeniedStateAndParams() {
        lastDeniedStateAndParams = null;
        localStorageService.remove(cacheKeys.LAST_STATE);
      }

      function _goToLogin() {
        $state.go(pages.login);
      }

      function _isPageApproved(securityControllerName, toParams) {
        var deferred,
          securityContext,
          response = {};

        deferred = $q.defer();
        if (!securityControllerName) {
          deferred.reject('You must define pass a valid securityController name');
          return;
        }

        function SecurityGuard() {}

        SecurityGuard.prototype.allow = function () {
          response.answer = true;
          deferred.resolve(response);
        }

        SecurityGuard.prototype.deny = function (requestApprovalState) {
          response.answer = false;
          response.requestApprovalState = requestApprovalState;
          deferred.resolve(response);
        }

        securityContext = {
          guard: new SecurityGuard(),
          permissionsDao: permissionsDao,
          toParams: toParams
        };

        var controllerLocals = {
          securityContext: securityContext
        };
        $controller(securityControllerName, controllerLocals);

        return deferred.promise;
      }

      function goToPostLoginPage(options) {
        var lastStateName,
          lastStateParams;
        
        options = options ? options : {};

        if (options.doNotGoToPostLogin) {
          return;
        }
        
        if (options && options.customPostLoginPage) {
          $state.go(options.customPostLoginPage);

        } else if (lastDeniedStateAndParams) {
          lastStateName = lastDeniedStateAndParams.state.name;
          lastStateParams = lastDeniedStateAndParams.params;
          removeLastDeniedStateAndParams();
          $state.go(lastStateName, lastStateParams);
        } else {
          $state.go(pages.postLogin);
        }
      }

      function goToPostLogoutPage() {
        var secured = $parse('current.data.secured')($state);
        if (secured || $state.current.name === pages.login) {
          $state.go(pages.postLogout);
        }
      }
    }

  }

})();
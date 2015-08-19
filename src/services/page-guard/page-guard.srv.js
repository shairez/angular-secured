(function () {

  angular
    .module("ngSecured.services")
    .provider('ngSecured.pageGuard', provider);


  var pages = {
    login: 'ngSecured.login',
    loginPopup: null,
    postLogin: null,
    unAuthorized: null
  };

  provider.$inject = ['$stateProvider'];

  function provider($stateProvider) {

    //$stateProvider.state(
    //  pages.login,
    //  {template: 'Please configure a login state'}
    //);

    this.setupPages = setupPages;
    this.$get = factory;

    function setupPages(config) {
      angular.extend(pages, config);
    }
  }


  factory.$inject = [
    '$rootScope',
    '$q',
    '$controller',
    '$state',
    'ngSecured.loginDao',
    'ngSecured.permissionsDao'
  ];
  function factory($rootScope,
                   $q,
                   $controller,
                   $state,
                   loginDao,
                   permissionsDao) {

    var lastDeniedStateAndParams;

    var pageGuard = {};
    pageGuard.setupListeners = setupListeners;
    pageGuard.goToPostLoginPage = goToPostLoginPage;
    pageGuard.goToPostLogoutPage = goToPostLogoutPage;
    pageGuard.setLastDeniedStateAndParams = setLastDeniedStateAndParams;
    pageGuard.getLastDeniedStateAndParams = getLastDeniedStateAndParams;

    // Private methods for testing, you should not use them directly
    pageGuard._handleStateChange = _handleStateChange;
    pageGuard._goToLogin = _goToLogin;
    pageGuard._isRouteApproved = _isRouteApproved;

    return pageGuard;

    function setupListeners() {
      $rootScope.$on('$stateChangeStart', pageGuard._handleStateChange);
    }

    function _handleStateChange(event, toState, toParams, fromState, fromParams) {
      var secured,
        showPopupIfConfigured = true;
      if (toState.data) {
        secured = toState.data.secured;
      }
      if (secured) {

        if (secured === true && !loginDao.isLoggedIn()) {
          event.preventDefault();
          pageGuard.setLastDeniedStateAndParams(toState, toParams);
          pageGuard._goToLogin(fromState.name, showPopupIfConfigured);
        }

        if (angular.isString(secured)) {
          event.preventDefault();
          verifySecurityPolicy(secured);
        }

        function verifySecurityPolicy(securityCtrlName){
          pageGuard
            ._isRouteApproved(securityCtrlName)
            .then(promiseSuccess);

          function promiseSuccess(response) {
            var stateName,
              params,
              requestApprovalState = response.requestApprovalState;

            if (response.answer === true) {
              $state.go(toState.name, toParams);

            }else if (requestApprovalState) {

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

            } else if (loginDao.isLoggedIn()) {
              $state.go(pages.unAuthorized);
            }else{
              pageGuard.setLastDeniedStateAndParams(toState, toParams);
              pageGuard._goToLogin(fromState.name, showPopupIfConfigured);
            }

          }
        }
      }
    }

    function setLastDeniedStateAndParams(state, params){
      lastDeniedStateAndParams = {
        state: state,
        params: params
      }
    }

    function getLastDeniedStateAndParams(){
      return lastDeniedStateAndParams;
    }

    function _goToLogin(fromStateName, showPopupIfConfigured) {
      if (fromStateName !== '' && showPopupIfConfigured) {
        $state.go(pages.loginPopup);
      } else {
        $state.go(pages.login);
      }
    }

    function _isRouteApproved(securityControllerName) {
      var deferred,
        securityGuard = {},
        securityContext,
        response = {};

      deferred = $q.defer();
      if (!securityControllerName) {
        deferred.reject('You must define pass a valid securityController name');
      }
      securityGuard.allow = function () {
        response.answer = true;
        deferred.resolve(response);
      }

      securityGuard.deny = function (requestApprovalState) {
        response.answer = false;
        response.requestApprovalState = requestApprovalState;
        deferred.resolve(response);
      }

      permissionsDao.getPermissions()
        .then(permissionReturned);

      function permissionReturned(permissions){
        securityContext = {
          setupListeners: securityGuard,
          permissions: permissions
        };

        var controllerLocals = {
          securityContext: securityContext
        };
        $controller(securityControllerName, controllerLocals);
      }

      return deferred.promise;
    }

    function goToPostLoginPage() {
      if (lastDeniedStateAndParams){
        $state.go(lastDeniedStateAndParams.state.name,
                  lastDeniedStateAndParams.params);
      }else{
        $state.go(pages.postLogin);
      }
    }

    function goToPostLogoutPage(){
      if ($state.current && $state.current.data.secured){
        $state.go(pages.postLogout);
      }
    }


  }

})();

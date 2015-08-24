(function () {

  angular
    .module("ngSecured.services")
    .provider('ngSecured.pageGuard', provider);

  provider.$inject = [
    '$stateProvider',
    'ngSecured.defaultStateNames'
  ];

  function provider($stateProvider,
                    defaultStateNames) {

    var pages = {
      login: defaultStateNames.LOGIN,
      loginPopup: null,
      postLogin: defaultStateNames.POST_LOGIN,
      postLogout: defaultStateNames.POST_LOGOUT,
      unAuthorized: defaultStateNames.NOT_AUTHORIZED
    };

    (function configureDefaultStates() {

      $stateProvider.state(defaultStateNames.BASE_STATE, {});
      $stateProvider.state(defaultStateNames.NOT_AUTHENTICATED,
        {views: {"@": {template: "please login to see this page."}}});
      $stateProvider.state(defaultStateNames.NOT_AUTHORIZED,
        {views: {"@": {template: "You are not .authorized to see this page."}}});
      $stateProvider.state(defaultStateNames.LOGIN,
        {views: {'@': {template: 'Please configure a login state'}}});
      $stateProvider.state(defaultStateNames.POST_LOGIN,
        {views: {'@': {template: 'Please configure a post logout state'}}});
      $stateProvider.state(defaultStateNames.POST_LOGOUT,
        {views: {'@': {template: 'Please configure a post login state'}}});
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
      'ngSecured.loginDao',
      'ngSecured.permissionsDao'
    ];
    function factory($rootScope,
                     $q,
                     $parse,
                     $log,
                     $controller,
                     $state,
                     loginDao,
                     permissionsDao) {

      var lastDeniedStateAndParams;

      var pageGuard = {};
      pageGuard.init = init;
      pageGuard.goToPostLoginPage = goToPostLoginPage;
      pageGuard.goToPostLogoutPage = goToPostLogoutPage;
      pageGuard.setLastDeniedStateAndParams = setLastDeniedStateAndParams;
      pageGuard.getLastDeniedStateAndParams = getLastDeniedStateAndParams;

      // Private methods for testing, you should not use them directly
      pageGuard._handleStateChange = _handleStateChange;
      pageGuard._goToLogin = _goToLogin;
      pageGuard._isRouteApproved = _isRouteApproved;

      return pageGuard;

      function init(){
        setupListeners();
        showWarnings();
      }

      function showWarnings(){
        if (pages.login === defaultStateNames.LOGIN){
          warnAboutState('Login');
        }
        if (pages.unAuthorized === defaultStateNames.NOT_AUTHORIZED){
          warnAboutState('unAuthorized');
        }
        if (pages.postLogin === defaultStateNames.POST_LOGIN){
          warnAboutState('postLogin');
        }
        if (pages.postLogout === defaultStateNames.POST_LOGOUT){
          warnAboutState('postLogout');
        }
        function warnAboutState(stateType){
          $log.error('In ngSecuredProvider.secure, you need to set the page name of "' + stateType + '"');
        }
      }

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

          function verifySecurityPolicy(securityCtrlName) {
            pageGuard
              ._isRouteApproved(securityCtrlName)
              .then(promiseSuccess);

            function promiseSuccess(response) {
              var stateName,
                params,
                requestApprovalState = response.requestApprovalState;

              if (response.answer === true) {
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

              } else if (loginDao.isLoggedIn()) {
                $state.go(pages.unAuthorized);
              } else {
                pageGuard.setLastDeniedStateAndParams(toState, toParams);
                pageGuard._goToLogin(fromState.name, showPopupIfConfigured);
              }

            }
          }
        }
      }

      function setLastDeniedStateAndParams(state, params) {
        lastDeniedStateAndParams = {
          state: state,
          params: params
        }
      }

      function getLastDeniedStateAndParams() {
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

        function permissionReturned(permissions) {
          securityContext = {
            guard: securityGuard,
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
        if (lastDeniedStateAndParams) {
          $state.go(lastDeniedStateAndParams.state.name,
                    lastDeniedStateAndParams.params);
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

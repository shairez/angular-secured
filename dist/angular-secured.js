(function(){
    angular.module('ngSecured.directives', []);
})();
;angular.module('ngSecured', [
  'ui.router',
  'LocalStorageModule',
  'ngSecured.services'
]);
;angular.module('ngSecured.services', ['ui.router'])
  .run(['ngSecured.securityEnforcer', function(securityEnforcer){
    securityEnforcer.init();
  }]);
;(function () {

  angular.module('ngSecured.services')
    .constant('ngSecured.cacheKeys', {
      TOKEN: 'token',
      LAST_STATE: 'lastState',
      PERMISSIONS_CACHE: 'permissionsCache',
      PERMISSIONS: 'permissions'
    });

})();
;angular.module("ngSecured.services")
    .constant("ngSecured.cacheOptions", {
        "timeout": {
            "FOREVER": "forever"
        },
        "location":{
            "LOCAL_STORAGE": "localStorage",
            "SESSION_STORAGE": "sessionStorage"
        },
        "cacheKeys": {
            MAIN_CACHE: "ngSecuredCache",
            LOGIN_CACHE: 'loginCache',
            IS_LOGGED_IN: "isLoggedIn",
            ROLES: "roles"
        }

    })
;(function(){

    var baseStateName = 'private__ngSecured';

    angular
      .module('ngSecured.services')
        .constant('ngSecured.defaultStateNames', {
            'BASE_STATE': baseStateName,
            'LOGIN': baseStateName + '.LOGIN',
            'POST_LOGOUT': baseStateName + '.POST_LOGOUT',
            'POST_LOGIN': baseStateName + '.POST_LOGIN',
            'NOT_AUTHENTICATED': baseStateName + '.notAuthenticated',
            'NOT_AUTHORIZED': baseStateName + '.notAuthorized'
        })

})();
;(function(){
    angular
      .module('ngSecured.services')
      .constant('ngSecured.errorMessages',{
        WRONG_JSON_PATH: 'Json Path was not defined or is not correct, value was: ',
        NO_PERMISSIONS_URL: 'permissionUrl is not defined'


      });
})();
;angular.module("ngSecured.directives")
.directive("asRole", ["ngSecured", "$animate",
                       function(ngSecured, $animate){
        return {
            transclude: "element",
            priority: 600,
            terminal: true,
            restrict: 'A',
            $$tlb: true,
            link: function($scope, $element, $attrs, ctrl, $transclude){
                var block, childScope,
                    role;

                function getBlockElements(nodes) {
                    var startNode = nodes[0],
                        endNode = nodes[nodes.length - 1];
                    if (startNode === endNode) {
                        return angular.element(startNode);
                    }

                    var element = startNode;
                    var elements = [element];

                    do {
                        element = element.nextSibling;
                        if (!element) break;
                        elements.push(element);
                    } while (element !== endNode);

                    return angular.element(elements);
                }

                function invalidateDom(){
                    if (ngSecured.includesRole(role)){
                        if (!childScope){
                            childScope = $scope.$new();
                            $transclude(childScope, function(clone){
                                clone[clone.length++] = document.createComment(' end asRole: ' + $attrs.asRole + ' ');
                                block = {clone:clone};
                                $animate.enter(clone, $element.parent(), $element);
                            })
                        }
                    }else{
                        if (block){
                            $animate.leave(getBlockElements(block.clone));
                            block = null;
                        }
                        if (childScope){
                            childScope.$destroy();
                            childScope = null;
                        }
                    }
                }

                // TODO: consider changing to $observe
                $scope.$watch(function(){return $attrs.asRole;}, function(newVal){
                    role = newVal;
                    invalidateDom();
                });
                $scope.$watch(function(){return ngSecured.getRoles();}, invalidateDom);
            }
        }
    }])
;(function(){
  angular
    .module('ngSecured.services')
    .provider('ngSecured.authAdapter', provider);

  provider.$inject = [

  ];
  function provider(){

    var errorMessage = 'You must configure an authAdapter dependency';

    this.setup = setup;
    this.$get = srv;

    function setup(){
      throw new Error(errorMessage);
    }

    function srv(){

      var placeHolder = {};
      placeHolder.login = throwErrorFn;
      placeHolder.isLoggedIn = throwErrorFn;
      placeHolder.logout = throwErrorFn;

      function throwErrorFn(){
        throw new Error(errorMessage);
      }
    }

  }


})();
;(function () {

  angular
    .module('ngSecured')
    .provider('ngSecured', provider);

  provider.$inject = [
    'localStorageServiceProvider',
    '$httpProvider',
    'ngSecured.authAdapterProvider',
    'ngSecured.permissionsDaoProvider',
    'ngSecured.securityEnforcerProvider',
    '$windowProvider'
  ];

  function provider(localStorageServiceProvider,
                    $httpProvider,
                    authAdapterProvider,
                    permissionsDaoProvider,
                    securityEnforcerProvider,
                    $windowProvider) {

    var config = {
      adapterOptions: {},
      permissions: {
        url: ''
      },
      pages: {
        login: 'ngSecured.login',
        loginPopup: null,
        unAuthorized: null,
        postLogin: null,
        postLogout: null
      }
    };


    this.secure = function (userConfig) {
      angular.extend(config, userConfig);
      localStorageServiceProvider.setPrefix('ngSecured_'+ getAppPath() + '_');
      //authAdapterProvider.setup(config.adapterOptions);
      permissionsDaoProvider.setup(config.permissions);
      securityEnforcerProvider.setupPages(config.pages);
    };

    function getAppPath(){
      var $window = $windowProvider.$get();
      return $window.location.pathname;
    }

    this.$get = factory;

    factory.$inject = [
      'ngSecured.authAdapter',
      'ngSecured.permissionsDao',
      'ngSecured.securityEnforcer'
    ];

    function factory(authAdapter,
                     permissionsDao,
                     securityEnforcer) {

      var ngSecured = {};

      ngSecured.login = login;
      ngSecured.logout = logout;
      ngSecured.isLoggedIn = isLoggedIn;

      function login(credentials) {
        return authAdapter
          .login(credentials)
          .then(success);

        function success(response) {
          securityEnforcer.goToPostLoginPage();
          return response;
        }
      }

      function logout() {
        authAdapter.logout();
        permissionsDao.clear();
        securityEnforcer.goToPostLogoutPage();
      }

      function isLoggedIn() {
        return authAdapter.isLoggedIn();
      }

      return ngSecured;
    }

  }


})();
;(function () {

  angular
    .module('ngSecured.services')
    .provider('ngSecured.permissionsDao', provider);

  provider.$inject = [];

  function provider() {

    var permissionsConfig = {
      url: '',
      permissionsJsonPath: ''
    };

    this.setup = setup;
    this.$get = factory;

    function setup(config) {
      angular.extend(permissionsConfig, config);
    }


    factory.$inject = [
      '$http',
      '$parse',
      '$log',
      'localStorageService',
      'ngSecured.cacheKeys',
      'ngSecured.errorMessages',
      '$q'
    ];
    function factory($http,
                     $parse,
                     $log,
                     localStorageService,
                     cacheKeys,
                     errorMessages,
                     $q) {

      var cachedPermissions;

      var permissionsDao = {};

      permissionsDao.find = find;
      permissionsDao.clear = clear;

      function find(shouldRefresh) {
        if (!shouldRefresh) {
          cachedPermissions = getCachedPermissions();
          if (cachedPermissions) {
            return $q.when(cachedPermissions);
          }
        }
        if (!permissionsConfig.url){
          return $q.reject(errorMessages.NO_PERMISSIONS_URL);
        }

        return $http.get(permissionsConfig.url)
          .then(success);

        function success(response) {
          var permissions = response.data;
          var jsonPath = permissionsConfig.permissionsJsonPath;
          if (jsonPath){
            permissions = $parse(jsonPath)(permissions)
            if (!permissions){
              var errorMsg = 'Permission url' + errorMessages.WRONG_JSON_PATH + '"'+ jsonPath + '"';
              $log.error(errorMsg);
              return $q.reject(new Error(errorMsg));

            }
          }

          localStorageService.set(cacheKeys.PERMISSIONS, permissions);
          cachedPermissions = permissions;
          return permissions;
        }
      }

      function getCachedPermissions() {
        if (cachedPermissions){
          return cachedPermissions;
        }
        cachedPermissions = localStorageService.get(cacheKeys.PERMISSIONS);
        return cachedPermissions;
      }

      function clear(){
        cachedPermissions = null;
        localStorageService.remove(cacheKeys.PERMISSIONS);
      }

      return permissionsDao;

    }
  }

})();
;(function () {

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

        function SecurityGuard() {
        }

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

      function goToPostLoginPage() {
        var lastStateName,
          lastStateParams;
        if (lastDeniedStateAndParams) {
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

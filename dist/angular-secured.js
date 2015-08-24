angular.module('ngSecured', [
  'ui.router',
  'ngSecured.services',
  'LocalStorageModule'
]);
;angular.module('ngSecured.services', ['ui.router'])
  .run(['ngSecured.pageGuard', function(pageGuard){
    pageGuard.init();
  }]);
;angular.module('ngSecured')
    .constant('ngSecured.cacheKeys', {
        LOGIN_CACHE: 'loginCache',
        TOKEN: 'token',
        PERMISSIONS_CACHE: 'permissionsCache',
        PERMISSIONS: 'permissions'
    })
;angular.module("ngSecured")
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
      .module('ngSecured')
      .constant('ngSecured.errorMessages',{
        WRONG_JSON_PATH: 'Json Path was not defined or is not correct, value was: '


      });
})();
;angular.module("ngSecured")
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
    }]);(function () {

  angular
    .module("ngSecured")
    .provider('ngSecured.httpManager', provider);


  provider.$inject = [
    '$httpProvider'
  ];
  function provider($httpProvider) {

    this.setupPages = setup;
    this.$get = factory;

    function setup(config) {
      setupTheInterceptor();
    }

    function setupTheInterceptor() {
      $httpProvider.interceptors.push(interceptor);

      interceptor.$inject = [
        "$injector",
        "$q"
      ];
      function interceptor($injector,
                           $q) {
        return {
          "request": requestHandler,
          "responseError": responseErrorHandler
        }

        function requestHandler(config){

        }

        function responseErrorHandler(error){
          return $q.reject(error);
        }

      };
    }
  }


  factory.$inject = [];
  function factory() {

    var httpManager = {};
    return httpManager;

  }

})();
;(function () {

  angular
    .module('ngSecured')
    .provider('ngSecured.loginDao', provider);


  var loginConfig = {
    loginUrl: '',
    tokenJsonPath: '',
    tokenAgeJsonPath: '',
    defaultTokenAge: 60 * 60 * 1000
  };

  provider.$inject = [];

  function provider() {

    this.setup = setup;
    this.$get = factory;

    function setup(config) {
      angular.extend(loginConfig, config);
    }
  }


  factory.$inject =
    ['$http',
     'ngSecured.cacheKeys',
     'localStorageService',
     '$parse',
     '$q',
     'ngSecured.errorMessages',
     '$log'
    ];
  function factory($http,
                   cacheKeys,
                   localStorageService,
                   $parse,
                   $q,
                   errorMessages,
                   $log) {

    var inMemoryToken,
      wrongPathMsg = errorMessages.WRONG_JSON_PATH;

    var loginDao = {};
    loginDao.login = login;
    loginDao.isLoggedIn = isLoggedIn;
    loginDao.logout = logout;
    loginDao.getToken = getToken;
    loginDao.setToken = setToken;

    return loginDao;


    function login(credentials) {
      return $http
        .post(loginConfig.loginUrl, credentials)
        .then(success);

      function success(response) {
        var maxAge;

        if (loginConfig.tokenAgeJsonPath) {
          maxAge = $parse(loginConfig.tokenAgeJsonPath)(response.data);
          if (!maxAge) {
            $log.warn(wrongPathMsg +
                         ' tokenAge , using the default instead');
          }
        }

        var token = $parse(loginConfig.tokenJsonPath)(response.data);
        if (!token) {
          var errorMsg = 'Token ' + wrongPathMsg + '"' + loginConfig.tokenJsonPath + '"';
          $log.error(errorMsg);
          return $q.reject(new Error(errorMsg));
        }
        logout();

        setToken(token, maxAge);

        return response.data;
      }
    }


    function isLoggedIn() {
      return !!getToken();
    }

    function logout() {
      inMemoryToken = null;
      localStorageService.remove(cacheKeys.TOKEN);
    }

    function setToken(token, maxAge) {

      if (!maxAge) {
        maxAge = loginConfig.defaultTokenAge;
      }
      inMemoryToken = token;
      localStorageService.set(cacheKeys.TOKEN, token);
    }

    function getToken() {
      if (inMemoryToken) return inMemoryToken;

      return localStorageService.get(cacheKeys.TOKEN);
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
    'ngSecured.loginDaoProvider',
    'ngSecured.permissionsDaoProvider',
    'ngSecured.pageGuardProvider'
  ];

  function provider(localStorageServiceProvider,
                    $httpProvider,
                    loginDaoProvider,
                    permissionsDaoProvider,
                    pageGuardProvider) {

    var config = {
      tokenAgeJsonPath: '',
      tokenJsonPath: '',
      loginUrl: '',
      permissionsUrl: '',
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
      localStorageServiceProvider.setPrefix('ngSecured');

      loginDaoProvider.setup(config);
      permissionsDaoProvider.setup(config);
      pageGuardProvider.setupPages(config.pages);
    };

    this.$get = factory;

    factory.$inject = [
      'ngSecured.loginDao',
      'ngSecured.pageGuard'
    ];

    function factory(loginDao,
                     pageGuard) {

      var ngSecured = {};

      ngSecured.login = login;
      ngSecured.logout = logout;
      ngSecured.isLoggedIn = isLoggedIn;

      function login(credentials) {
        return loginDao
          .login(credentials)
          .then(success);

        function success(response) {
          pageGuard.goToPostLoginPage();
          return response;
        }
      }

      function logout() {
        loginDao.logout();
        pageGuard.goToPostLogoutPage();
      }

      function isLoggedIn() {
        return loginDao.isLoggedIn();
      }

      return ngSecured;
    }

  }


})();
;(function () {

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
;(function () {

  angular
    .module('ngSecured.services')
    .provider('ngSecured.permissionsDao', provider);

  provider.$inject = [];

  function provider() {

    var permissionsConfig = {
      permissionsUrl: ''
    };

    this.setup = setup;
    this.$get = factory;

    function setup(config) {
      angular.extend(permissionsConfig, config);
    }


    factory.$inject = [
      '$http',
      'localStorageService',
      'ngSecured.cacheKeys',
      '$q'
    ];
    function factory($http,
                     localStorageService,
                     cacheKeys,
                     $q) {

      var cachedPermissions;

      var permissionsDao = {};

      permissionsDao.getPermissions = getPermissions;

      function getPermissions(shouldRefresh) {
        if (!shouldRefresh) {
          cachedPermissions = getCachedPermissions();
          if (cachedPermissions) {
            return $q.when(cachedPermissions);
          }
        }

        return $http.get(permissionsConfig.permissionsUrl)
          .then(success);

        function success(response) {
          var permissions = response.data;
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


      return permissionsDao;

    }
  }

})();

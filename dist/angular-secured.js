angular.module('ngSecured', [
  'ui.router',
  'angular-cache',
  'ngSecured.services'
]);

angular.module('ngSecured.services', ['ui.router']);

angular.module('ngSecured')
    .constant('ngSecured.cacheKeys', {
        LOGIN_CACHE: 'loginCache',
        TOKEN: 'token',
        PERMISSIONS_CACHE: 'permissionsCache',
        PERMISSIONS: 'permissions'
    })

angular.module("ngSecured")
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

;(function(angular){

    var baseStateName = "private__ngSecured";

    angular.module("ngSecured")
        .constant("ngSecured.defaultStateNames", {
            "BASE_STATE": baseStateName,
            "NOT_AUTHENTICATED": baseStateName + ".notAuthenticated",
            "NOT_AUTHORIZED": baseStateName + ".notAuthorized"
        })

})(angular);
angular.module("ngSecured")
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
(function () {

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

(function () {

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


  factory.$inject = ['$http',
                     'ngSecured.cacheKeys',
                     'CacheFactory',
                     '$parse',
                     '$q'];
  function factory($http,
                   cacheKeys,
                   CacheFactory,
                   $parse,
                   $q) {

    var inMemoryToken;

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
            console.warn("Can't find maxAgeResponsePath '" +
                         loginConfig.tokenAgeJsonPath +
                         "', just so you know")
          }
        }

        var token = $parse(loginConfig.tokenJsonPath)(response.data);
        if (!token) {
          return $q.reject("Couldn't find the token on the response in the path - '"+
                           loginConfig.tokenJsonPath
                           +"', check your configuration");
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
      var loginCache = getLoginCache();
      if (loginCache) loginCache.remove(cacheKeys.TOKEN);
    }

    function setToken(token, maxAge){

      if (!maxAge){
        maxAge = loginConfig.defaultTokenAge;
      }
      inMemoryToken = token;

      var loginCache = CacheFactory(cacheKeys.LOGIN_CACHE, {maxAge: maxAge});
      loginCache.put(cacheKeys.TOKEN, token);
    }

    function getToken(){
      if (inMemoryToken) return inMemoryToken;

      var loginCache = getLoginCache();
      if (loginCache){
        return loginCache.get(cacheKeys.TOKEN);
      }
    }

    function getLoginCache() {
      return CacheFactory.get(cacheKeys.LOGIN_CACHE);
    }

  }

})();

(function () {

  angular
    .module('ngSecured')
    .provider('ngSecured', provider);

  provider.$inject = [
    '$stateProvider',
    '$httpProvider',
    'ngSecured.loginDaoProvider',
    'ngSecured.permissionsDaoProvider',
    'ngSecured.pageGuardProvider'
  ];

  function provider($stateProvider,
                    $httpProvider,
                    loginDaoProvider,
                    permissionsDaoProvider,
                    pageGuardProvider) {

    var config = {
      pages: {
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
      }
    };

    //$stateProvider.state(defaultStateNames.BASE_STATE, {});
    //$stateProvider.state(defaultStateNames.NOT_AUTHENTICATED,
    //  {views: {"@": {template: "please login to see this page."}}});
    //$stateProvider.state(defaultStateNames.NOT_AUTHORIZED,
    //  {views: {"@": {template: "You are not .authorized to see this page."}}});

    this.secure = function (userConfig) {
      angular.extend(config, userConfig);
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

        function success(response){
          pageGuard.goToPostLoginPage();
          return response;
        }
      }

      function logout(){
        loginDao.logout();
        pageGuard.goToPostLogoutPage();
      }

      function isLoggedIn(){
        return loginDao.isLoggedIn();
      }

      return ngSecured;
    }

  }


})();

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

(function () {

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
      'CacheFactory',
      'ngSecured.cacheKeys',
      '$q'
    ];
    function factory($http,
                     CacheFactory,
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
          var permissionsCache = getPermissionsCache();
          permissionsCache.put(cacheKeys.PERMISSIONS, permissions);
          cachedPermissions = permissions;
          return permissions;
        }
      }

      function getPermissionsCache() {
        var permissionsCache = CacheFactory.get(cacheKeys.PERMISSIONS_CACHE);
        if (!permissionsCache) {
          permissionsCache = CacheFactory(cacheKeys.PERMISSIONS_CACHE);
        }
        return permissionsCache;
      }

      function getCachedPermissions() {
        if (cachedPermissions){
          return cachedPermissions;
        }
        var permissionsCache = getPermissionsCache();
        cachedPermissions = permissionsCache.get(cacheKeys.PERMISSIONS);
        return cachedPermissions;
      }


      return permissionsDao;

    }
  }

})();

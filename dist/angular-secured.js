angular.module('ngSecured', ["ui.router", "jmdobry.angular-cache"])
        .run(["ngSecured", function(ngSecured){}] );

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
angular.module("ngSecured")
    .provider("ngSecured", ["$stateProvider",
                            "ngSecured.defaultStateNames",
                            "ngSecured.cacheOptions",
                            function ($stateProvider,
                                      defaultStateNames,
                                      cacheOptions) {

        var config = {
                loginState: defaultStateNames.NOT_AUTHENTICATED,
                unAuthorizedState: defaultStateNames.NOT_AUTHORIZED,
                postLoginState: defaultStateNames.NOT_AUTHENTICATED,
	            fetchRoles: undefined,
                login: undefined,
                isAuthenticated: undefined,
                cache:{
                    timeout: cacheOptions.timeout.FOREVER,
                    location: cacheOptions.location.LOCAL_STORAGE
                }
            };

        $stateProvider.state(defaultStateNames.BASE_STATE, {});
        $stateProvider.state(defaultStateNames.NOT_AUTHENTICATED, {views: {"@": {template: "please login to see this page."}}});
        $stateProvider.state(defaultStateNames.NOT_AUTHORIZED, {views: {"@": {template: "You are not authorized to see this page."}}});

        this.secure = function (userConfig) {
            angular.extend(config, userConfig);
        }

        this.$get = ["$rootScope", "$state", "$q", "$injector",
                     "$angularCacheFactory",
            function ($rootScope, $state, $q, $injector,
                      $angularCacheFactory) {

                var lastStateName,
                    lastStateParams,
                    roles,
                    cache;

                function initVars() {
                    lastStateName = config.postLoginState;
                    if (config.cache){
                        cache = $angularCacheFactory(cacheOptions.cacheKeys.MAIN_CACHE,
                                                    {storageMode: config.cache.location});
                    }

                }

                initVars();

                $rootScope.$on("$stateChangeStart", function (event, toState, toParams) {

                    if (!!toState.secured) {

                        if (!isAuthenticated()) {
                            event.preventDefault();
                            lastStateName = toState.name;
                            lastStateParams = toParams;
                            $state.go(config.loginState);
                        } else if (toState.secured.hasOwnProperty("role")) {

                            if (!roles || roles.indexOf(toState.secured.role)) {
                                event.preventDefault();
                                $state.go(config.unAuthorizedState);
                            }
                        }
                    }
                })

                function goToLastState() {
                    if (lastStateName) {
                        $state.go(lastStateName, lastStateParams);
                    }
                }

	            function fetchingRoles(){
                   if (!config.fetchRoles){
                       throw new Error("fetchRoles is not defined");
                   }
                    var rolesFetchResult = $injector.invoke(config.fetchRoles);

                    return $q.when(rolesFetchResult).then(
                        function (rolesValue) {
                            if (rolesValue) {
                                setRoles(rolesValue);
                            }
                            return rolesValue;
                        }
                    )

	            }

                function isAuthenticated(){
                    if (config.isAuthenticated){
                        return $injector.invoke(config.isAuthenticated);
                    }else if (config.cache && cache){
                        return cache.get(cacheOptions.cacheKeys.IS_LOGGED_IN);
                    }
                    return false;
                }

                function getRoles(){
                    if (!roles && config.cache){
                        roles = cache.get(cacheOptions.cacheKeys.ROLES);
                    }
                    return roles;
                }

	            function setRoles(rolesValue) {
		            if (angular.isString(rolesValue)) {
			            roles = [rolesValue];
		            } else if (!angular.isArray(rolesValue)) {
			            roles = undefined;
		            } else {
			            roles = rolesValue;
		            }
                    if (roles && config.cache){
                        cache.put(cacheOptions.cacheKeys.ROLES, roles)
                    }
	            }

                function includesRole(role) {
                    if (roles && roles.indexOf(role) !== -1) {
                        return true;
                    }
                    return false;
                }

                function loggingIn(credentials) {

                    if (!config.login) {
                        throw new Error("login function must be configured");
                    } else {
                        var loginPromise = $q.when($injector.invoke(config.login, config, {credentials: credentials}));
                        loginPromise.then(function(result){

                            if (config.cache){
                                cache.put(cacheOptions.cacheKeys.IS_LOGGED_IN, true);
                            }

                            if (config.fetchRoles){
                                fetchingRoles().then(function(){
                                    goToLastState();
                                });
                            }else{
                                goToLastState();
                            }
                        })
                        return loginPromise;
                    }
                }

                function getCache(){
                    return angular.copy(config.cache);
                }

                function loggingOut(){
                    var result;
                    if (cache){
                        cache.removeAll();
                    }
                    if (config.logout){
                        result = $injector.invoke(config.logout);
                    }
                    return $q.when(result);
                }

                return {
                    _initVars: initVars,
                    _getCache: getCache,
                    loggingIn: loggingIn,
                    fetchingRoles: fetchingRoles,
                    isAuthenticated: isAuthenticated,
                    setRoles: setRoles,
                    getRoles: getRoles,
                    includesRole: includesRole,
                    loggingOut: loggingOut
                }
            }];
    }])
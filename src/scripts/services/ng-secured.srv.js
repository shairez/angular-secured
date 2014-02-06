angular.module("ngSecured")
    .provider("ngSecured", ["$stateProvider", function ($stateProvider) {

        var baseStateName = "private__ngSecured",
            defaultStateNames = {
                "BASE_STATE": baseStateName,
                "NOT_AUTHENTICATED": baseStateName + ".notAuthenticated",
                "NOT_AUTHORIZED": baseStateName + ".notAuthorized"
            },
            config = {
                loginState: defaultStateNames.NOT_AUTHENTICATED,
                unAuthorizedState: defaultStateNames.NOT_AUTHORIZED,
                isAuthenticated: function(){ return false},
                postLoginState: defaultStateNames.NOT_AUTHENTICATED
            };

        $stateProvider.state(defaultStateNames.BASE_STATE, {});
        $stateProvider.state(defaultStateNames.NOT_AUTHENTICATED, {views: {"@": {template: "please login to see this page."}}});
        $stateProvider.state(defaultStateNames.NOT_AUTHORIZED, {views: {"@": {template: "You are not authorized to see this page."}}});


        this.secure = function(userConfig){
            angular.extend(config, userConfig);

        }

        this.$get = ["$rootScope", "$state", "$q",
                      function ($rootScope, $state, $q) {

            var lastStateName,
                lastStateParams,
                roles;

            function initVars(){
                lastStateName = config.postLoginState;
            }

            initVars();

            $rootScope.$on("$stateChangeStart", function(event, toState, toParams){
                if (!!toState.secured){

                    if (!config.isAuthenticated()){
                        event.preventDefault();
                        lastStateName = toState.name;
                        lastStateParams = toParams;
                        $state.go(config.loginState);
                    }else if (toState.secured.hasOwnProperty("role")){

                        if (!roles || roles.indexOf(toState.secured.role)){

                            event.preventDefault();
                            $state.go(config.unAuthorizedState);
                        }
                    }
                }
            })

            function goToLastState(){
                if (lastStateName){
                    $state.go(lastStateName, lastStateParams);
                }
            }

            return {
                defaultStateNames: defaultStateNames,
                _initVars: initVars,

                login: function(credentials){

                    if (!config.login || !angular.isFunction(config.login)){
                        throw new Error("login function must be configured");
                    }else{
                        var rolesPossiblePromise = config.login(credentials);
                        var that = this;
                        $q.when(rolesPossiblePromise).then(
                            function(rolesValue){
                                if (rolesValue){
                                    that.setRoles(rolesValue);
                                }
                                goToLastState();
                            }
                        )
                    }
                },

                setRoles: function(rolesValue){
                    if (angular.isString(rolesValue)){
                        roles = [rolesValue];
                    }else if(!angular.isArray(rolesValue)){
                        throw new Error("roles must be a String or an Array");
                    }else{
                        roles = rolesValue;
                    }
                },

                getRoles: function(){
                    return roles;
                },

                includesRole: function(role){
                    if (roles && roles.indexOf(role) !== -1){
                        return true;
                    }
                    return false;
                }


            }
        }];
    }])
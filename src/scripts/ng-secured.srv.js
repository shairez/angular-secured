angular.module("ngSecured")
    .provider("ngSecured", ["$stateProvider", function ($stateProvider) {

        var baseStateName = "$ngSecured",
            defaultStateNames = {
                "BASE_STATE": baseStateName,
                "NOT_AUTHENTICATED": baseStateName + ".notAuthenticated"
            },
            config = {
                loginState: defaultStateNames.NOT_AUTHENTICATED,
                isAuthenticated: function(){ return false}
            };

        $stateProvider.state(defaultStateNames.BASE_STATE, {});
        $stateProvider.state(defaultStateNames.NOT_AUTHENTICATED, {views: {"@": {template: "please login to see this page."}}});


        this.configAuth = function(userConfig){
            angular.extend(config, userConfig);

        }

        this.$get = ["$rootScope", "$state", function ($rootScope, $state) {

            $rootScope.$on("$stateChangeStart", function(event, toState){
                if (!!toState.secure){

                    if (!config.isAuthenticated()){
                        event.preventDefault();
                        $state.go(config.loginState);
                    }


                }
            })

            return {
                defaultStateNames: defaultStateNames
            }


        }];
    }])
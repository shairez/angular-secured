describe("ngSecured", function () {

	var ngSecured,
        ngSecuredProvider,
        $state,
        $rootScope,
        $stateProvider,
        stateName = "testState",
        loginStateName = "loginState";

	beforeEach(module("ngSecured"));

    beforeEach(module(function(_ngSecuredProvider_, _$stateProvider_){
        $stateProvider = _$stateProvider_;
        ngSecuredProvider = _ngSecuredProvider_;
    }));

	beforeEach(inject(["ngSecured",
                       "$state",
                       "$rootScope",
		function (_ngSecured,
                    _$state,
                    _$rootScope) {
            ngSecured = _ngSecured;
            $state = _$state;
            $rootScope = _$rootScope;
	}]));

    describe("transitioning to a state", function () {
        When(function(){
            $rootScope.$apply(function(){
                $state.go(stateName);
            });
        });

        describe("insecure state", function () {
            Given(function(){ $stateProvider.state(stateName, {}); });
            Then(function(){ expect($state.current.name).toBe( stateName ); });
        });

        describe("secure state", function () {
            Given(function(){ $stateProvider.state(stateName, {secure: {} }); });

            describe("no login state configured", function () {
                Then(function(){
                    expect($state.current.name).toBe( ngSecured.defaultStateNames.NOT_AUTHENTICATED );
                });
            });
            describe("login state is configured", function () {
                Given(function(){
                    ngSecuredProvider.configAuth({
                        loginState: loginStateName
                    });
                    $stateProvider.state(loginStateName, {});
                });
                Then(function(){ expect($state.current.name).toBe( loginStateName ); });


                describe("if not authenticated", function () {
                    Given(function(){ ngSecuredProvider.configAuth({
                            isAuthenticated: function(){ return false; }
                            })
                    });
                    Then(function(){ expect($state.current.name).toBe( loginStateName ); });
                });

                describe("if authenticated", function () {
                    Given(function(){ ngSecuredProvider.configAuth({
                        isAuthenticated: function(){ return true; }
                        })
                    });
                    Then(function(){ expect($state.current.name).toBe( stateName ); });
                });
            });



        });
    });

});
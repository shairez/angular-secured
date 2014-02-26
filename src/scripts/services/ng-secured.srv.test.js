describe("ngSecured", function () {

	var ngSecured,
        ngSecuredProvider,
        $state,
        $rootScope,
        $stateProvider,
        $q,
        stateName = "testState",
        stateParams = {sectionId: '1'},
        loginStateName = "loginState",
        secureState = {secured: {}, url:"/:sectionId" };

	beforeEach(module("ngSecured"));

    beforeEach(module(function(_ngSecuredProvider_, _$stateProvider_){
        $stateProvider = _$stateProvider_;
        ngSecuredProvider = _ngSecuredProvider_;

    }));

	beforeEach(inject(["ngSecured",
                       "$state",
                       "$rootScope",
                       "$q",
		function (_ngSecured,
                    _$state,
                    _$rootScope,
                    _$q) {
            ngSecured = _ngSecured;
            $state = _$state;
            $rootScope = _$rootScope;
            $q = _$q;
	}]));

    describe("transitioning to a state", function () {
        When(function(){
            $rootScope.$apply(function(){
                $state.go(stateName, stateParams);
            });
        });

        describe("insecure state", function () {
            Given(function(){ $stateProvider.state(stateName, {}); });
            Then(function(){ expect($state.current.name).toBe( stateName ); });
        });

        describe("secure state", function () {
            Given(function(){ $stateProvider.state(stateName, secureState); });

            describe("no login state configured", function () {
                Then(function(){
                    expect($state.current.name).toBe( ngSecured.defaultStateNames.NOT_AUTHENTICATED );
                });
            });
            describe("login state is configured", function () {
                Given(function(){
                    ngSecuredProvider.secure({
                        loginState: loginStateName
                    });
                    $stateProvider.state(loginStateName, {});
                });
                Then(function(){ expect($state.current.name).toBe( loginStateName ); });


                describe("if not authenticated", function () {
                    Given(function(){
                        ngSecuredProvider.secure({
                            isAuthenticated: function(){ return false; },
                            login: function(){}
                        })
                    });
                    Then(function(){ expect($state.current.name).toBe( loginStateName ); });


                    describe("but after login, should continue to the last state and params", function () {

                        When(function(){
                            ngSecuredProvider.secure({
                                isAuthenticated: function(){ return true; },
                                login: function(){ return "admin"; }
                            })
                            ngSecured.login();
                            $rootScope.$apply();

                        });
                        Then(function(){
                            expect($state.current.name).toBe( stateName );
                            expect($state.params).toEqual( stateParams );
                        });
                    });
                });

                describe("if authenticated", function () {
                    Given(function(){ ngSecuredProvider.secure({
                        isAuthenticated: [function(){ return true; }]
                        })
                    });
                    Then(function(){ expect($state.current.name).toBe( stateName ); });

                    describe("and state is secured with a role", function () {
                        Given(function(){
                            secureState.secured.role = "admin";
                        });

                        describe("if user not authorized", function () {
                            Then(function(){
                                expect($state.current.name).toBe( ngSecured.defaultStateNames.NOT_AUTHORIZED ); });
                        });

                        describe("user is authorized", function () {
                            Given(function(){ ngSecured.setRoles(['admin']); });
                            Then(function(){ expect($state.current.name).toBe( stateName ); });
                        });
                    });
                });
            });
        });

	    describe("should fetch roles", function () {
            Given(function(){ $stateProvider.state(stateName, {}); });

            describe("if fetchRoles is defined and getRoles returns nothing", function () {
                Given(function(){
                    ngSecuredProvider.secure({
                        fetchRoles: function(){
                            return "admin";
                        }
                    })
                });

                describe("if getRoles returns nothing", function () {
                    Given(function(){ ngSecured.setRoles(undefined); });
                    Then(function(){
                        expect(ngSecured.getRoles()).toEqual(['admin']);
                        expect($state.current.name).toBe( stateName );
                    });
                });
                describe("if getRoles returns something", function () {
                    Given(function(){ ngSecured.setRoles(['user']); });
                    Then(function(){ expect(ngSecured.getRoles()).toEqual(['user']) });
                });
            });

            describe("if fetchRoles isn't defined", function () {
                Then(function(){
                    expect(ngSecured.getRoles()).toBeUndefined();
                });
            });
	    });
    });

    describe("isAuthenticated should be able to inject dependencies", function () {
        var $qInjection;

        Given(function(){
            ngSecuredProvider.secure({
                isAuthenticated: [
                    "$q",
                    function($q){
                        $qInjection = $q;
                    }
                ]
            })
        });
        When(function(){ ngSecured.isAuthenticated(); });
        Then(function(){ expect($qInjection).toBe($q) });
    });

    describe("set roles", function () {
        var roles;

        describe("one role", function () {
            Given(function(){ roles = "admin" });
            When(function(){ ngSecured.setRoles(roles); });
            Then(function(){
                var savedRoles = ngSecured.getRoles();
                expect(savedRoles).toEqual(['admin'])
            });
        });
        describe("multiple role", function () {
            Given(function(){ roles = ["admin", 'user'] });
            When(function(){ ngSecured.setRoles(roles); });
            Then(function(){
                var savedRoles = ngSecured.getRoles();
                expect(savedRoles).toEqual(roles)
            });
        });
        describe("set undefined if not array or string", function () {
            Given(function(){ roles = 23; });
            When(function(){ ngSecured.setRoles(roles); });
            Then(function(){
                expect(ngSecured.getRoles()).toBeUndefined() });
        });
    });

    describe("include role", function () {
        Given(function(){ ngSecured.setRoles(['admin']); });
        Then(function(){ expect(ngSecured.includesRole('admin')).toBe(true); });
    });

    describe("doesn't include a role", function () {
        Then(function(){ expect(ngSecured.includesRole('admin')).toBe(false); });
    });


    describe("login", function () {

        describe("login is not configured", function () {
            Then(function(){ expect(function(){ ngSecured.login();}).toThrow(); });
        });
        describe("login is configured", function () {

            var credentials = {username: "david", password: "1234"};

            Given(function(){
                ngSecuredProvider.secure({
                    login: function(credentials){}
                })
            });

            When(function(){
                $rootScope.$apply(function(){
                    ngSecured.login(credentials);
                });
            });

            describe("should pass the credentials to the actual login function", function () {
                var passedCreds;
                Given(function(){
                    ngSecuredProvider.secure({
                        login: function(credentials){
                            passedCreds = credentials;
                        }
                    })
                });
                Then(function(){ expect(passedCreds).toBe(credentials); });
            });

            describe("should inject dependencies", function () {
                var $qInjection;
                Given(function(){
                    ngSecuredProvider.secure({
                        login: ["credentials", "$q", function(credentials, $q){
                            passedCreds = credentials;
                            $qInjection = $q;
                        }]
                    })
                });
                Then(function(){ expect($qInjection).toBe($q) });
            });

            describe("should return a promise", function () {
                var result;
                Given(function(){
                    ngSecuredProvider.secure({
                        login: function(credentials){
                            return "test";
                        }
                    })
                });
                When(function(){
                    $rootScope.$apply(function(){
                        ngSecured.login().then(function(response){
                            result = response;
                        })
                    })

                });
                Then(function(){ expect(result).toBe('test') });
            });

            describe("should set roles from login invoke result", function () {

                describe("fetchRoles return a value", function () {
                    Given(function(){
                        ngSecuredProvider.secure({
	                        fetchRoles: function(){
                                return "admin";
                            }
                        })
                    });
                    Then(function(){ expect(ngSecured.getRoles()).toEqual(['admin']) });
                });
                describe("fetchRoles return a promise", function () {
                    Given(function(){
                        ngSecuredProvider.secure({
	                        fetchRoles: function(){
                                var defer = $q.defer();
                                defer.resolve("admin");
                                return defer.promise;
                            }
                        })
                    });
                    Then(function(){ expect(ngSecured.getRoles()).toEqual(['admin']) });
                });
            });

            describe("post login state is not defined", function () {
                Then(function(){ expect($state.current.name).toBe(ngSecured.defaultStateNames.NOT_AUTHENTICATED); });
            });

            describe("post login state is defined", function () {
                Given(function(){
                    $stateProvider.state(stateName, {});
                    ngSecuredProvider.secure({
                        postLoginState: stateName
                    });
                    ngSecured._initVars();
                });
                Then(function(){ expect($state.current.name).toBe(stateName); });
            });

        });
    });

	describe("Fetching Roles", function () {
		var result;

		describe("fetchRoles is not defined", function () {
			Then(function(){ expect(function (){ ngSecured.fetchingRoles() }).toThrow("fetchRoles is not defined") });
		});

        describe("fetchRoles is defined", function () {
            When(function(){
                $rootScope.$apply(function(){
                    ngSecured.fetchingRoles().then(function(response){
                        result = response;
                    })
                })
            });

            describe("fetchRoles return a normal value", function () {
                Given(function(){
                    ngSecuredProvider.secure({
                        fetchRoles: function(){ return "admin"; }
                    })
                });
                Then(function(){ expect(result).toEqual("admin") });
            });

            describe("fetchRoles can be injected", function () {
                Given(function(){ ngSecuredProvider.secure({
                    fetchRoles: [function(){ return "admin"; }]
                })
                });
                Then(function(){ expect(result).toEqual("admin") });
            });
        });

	});



});
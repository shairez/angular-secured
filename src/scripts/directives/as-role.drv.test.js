describe("asRole directive", function () {

	var $rootScope,
        $compile,
        scope,
        element,
        ngSecured;

	beforeEach(module("ngSecured",
                      "mocks.ngSecured"));

	beforeEach(inject(["$rootScope",
                       "$compile",
                       "ngSecured",
		function (_$rootScope,
                    _$compile,
                    _ngSecured) {
            ngSecured = _ngSecured;
            $rootScope = _$rootScope;
            scope = $rootScope.$new();
            $compile = _$compile;
            element = $compile("<div></div>")(scope);

	}]));

    function makeAsRole(role){
        element.append($compile('<div as-role="'+role+'"><div>Hi</div></div>')(scope));
        scope.$apply();
    }

    function expectDomToBeAdded(){
        expect(element.children().length).toBe(1);
    }
    function expectDomToBeRemoved(){
        expect(element.children().length).toBe(0);
    }

    describe("user has no roles", function () {

        Then(function(){ expectDomToBeRemoved(); });

	    describe("asRole is set to admin, should not show the dom", function () {
            Given(function(){
                makeAsRole('admin');
            });
            Then(function(){ expectDomToBeRemoved(); });
	    });
     });

    describe("user has roles", function () {

        describe("user is admin, should show dom ", function () {
            Given(function(){
                ngSecured.includesRole.andReturn(true);
                makeAsRole('admin');
            });
            Then(function(){ expectDomToBeAdded(); });
        });

        describe("roles are updated, directive should listen", function () {
            Given(function(){

                ngSecured.getRoles.andReturn(undefined);
	            ngSecured.includesRole.andReturn(false);
                makeAsRole('admin');
            });
            Then(function(){

                expectDomToBeRemoved();
	            ngSecured.includesRole.andReturn(true);
	            ngSecured.getRoles.andReturn(['admin']);
                $rootScope.$apply();
                expectDomToBeAdded();
            });
        });

    });








});
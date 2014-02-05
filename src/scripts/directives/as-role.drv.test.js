describe("asRole directive", function () {

	var $rootScope,
        $compile,
        scope,
        element,
        _ngSecured;

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

    describe("asRole is set to admin", function () {


	    describe("user is not an admin, should not show the dom", function () {
		    Given(function(){
			    makeAsRole('admin');
		    });
            Then(function(){ expect(element.children().length).toBe(0); });
	    });

	    describe("user is admin, should show dom ", function () {
		    Given(function(){
			    ngSecured.includeRole.andCallFake(function(role){
				    return role === 'admin';
			    });
			    makeAsRole('admin');
		    });
		    Then(function(){ expect(element.children().length).toBe(1); });
	    });
     });






});
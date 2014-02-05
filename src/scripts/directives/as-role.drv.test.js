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

    describe("asRole should show dom if role is correct", function () {

        Given(function(){

            ngSecured.includeRole.andReturn('admin');

            makeAsRole('admin');

            console.log("element", element );
        });

        Then(function(){ expect(element.children().length).toBe(0); });
     });



});
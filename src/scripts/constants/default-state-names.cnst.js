(function(angular){

    var baseStateName = "private__ngSecured";

    angular.module("ngSecured")
        .constant("ngSecured.defaultStateNames", {
            "BASE_STATE": baseStateName,
            "NOT_AUTHENTICATED": baseStateName + ".notAuthenticated",
            "NOT_AUTHORIZED": baseStateName + ".notAuthorized"
        })

})(angular);
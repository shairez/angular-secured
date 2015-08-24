(function(){

    var baseStateName = 'private__ngSecured';

    angular
      .module('ngSecured.services')
        .constant('ngSecured.defaultStateNames', {
            'BASE_STATE': baseStateName,
            'LOGIN': baseStateName + '.LOGIN',
            'POST_LOGOUT': baseStateName + '.POST_LOGOUT',
            'POST_LOGIN': baseStateName + '.POST_LOGIN',
            'NOT_AUTHENTICATED': baseStateName + '.notAuthenticated',
            'NOT_AUTHORIZED': baseStateName + '.notAuthorized'
        })

})();

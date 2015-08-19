(function () {

  angular
    .module('ngSecured')
    .provider('ngSecured', provider);

  provider.$inject = [
    '$stateProvider',
    '$httpProvider',
    'ngSecured.loginDaoProvider',
    'ngSecured.permissionsDaoProvider',
    'ngSecured.pageGuardProvider'
  ];

  function provider($stateProvider,
                    $httpProvider,
                    loginDaoProvider,
                    permissionsDaoProvider,
                    pageGuardProvider) {

    var config = {
      pages: {
        tokenAgeJsonPath: '',
        tokenJsonPath: '',
        loginUrl: '',
        permissionsUrl: '',
        pages: {
          login: 'ngSecured.login',
          loginPopup: null,
          unAuthorized: null,
          postLogin: null,
          postLogout: null
        }
      }
    };

    //$stateProvider.state(defaultStateNames.BASE_STATE, {});
    //$stateProvider.state(defaultStateNames.NOT_AUTHENTICATED,
    //  {views: {"@": {template: "please login to see this page."}}});
    //$stateProvider.state(defaultStateNames.NOT_AUTHORIZED,
    //  {views: {"@": {template: "You are not .authorized to see this page."}}});

    this.secure = function (userConfig) {
      angular.extend(config, userConfig);
      loginDaoProvider.setup(config);
      permissionsDaoProvider.setup(config);
      pageGuardProvider.setupPages(config.pages);
    };

    this.$get = factory;

    factory.$inject = [
      'ngSecured.loginDao',
      'ngSecured.pageGuard'
    ];

    function factory(loginDao,
                     pageGuard) {

      var ngSecured = {};

      ngSecured.login = login;
      ngSecured.logout = logout;
      ngSecured.isLoggedIn = isLoggedIn;

      function login(credentials) {
        return loginDao
          .login(credentials)
          .then(success);

        function success(response){
          pageGuard.goToPostLoginPage();
          return response;
        }
      }

      function logout(){
        loginDao.logout();
        pageGuard.goToPostLogoutPage();
      }

      function isLoggedIn(){
        return loginDao.isLoggedIn();
      }

      return ngSecured;
    }

  }


})();

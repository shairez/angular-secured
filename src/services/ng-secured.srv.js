(function () {

  angular
    .module('ngSecured')
    .provider('ngSecured', provider);

  provider.$inject = [
    'localStorageServiceProvider',
    '$httpProvider',
    'ngSecured.loginDaoProvider',
    'ngSecured.permissionsDaoProvider',
    'ngSecured.pageGuardProvider'
  ];

  function provider(localStorageServiceProvider,
                    $httpProvider,
                    loginDaoProvider,
                    permissionsDaoProvider,
                    pageGuardProvider) {

    var config = {
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
    };


    this.secure = function (userConfig) {
      angular.extend(config, userConfig);
      localStorageServiceProvider.setPrefix('ngSecured');

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

        function success(response) {
          pageGuard.goToPostLoginPage();
          return response;
        }
      }

      function logout() {
        loginDao.logout();
        pageGuard.goToPostLogoutPage();
      }

      function isLoggedIn() {
        return loginDao.isLoggedIn();
      }

      return ngSecured;
    }

  }


})();

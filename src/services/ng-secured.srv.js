(function () {

  angular
    .module('ngSecured')
    .provider('ngSecured', provider);

  provider.$inject = [
    'localStorageServiceProvider',
    '$httpProvider',
    'ngSecured.authAdapterProvider',
    'ngSecured.permissionsDaoProvider',
    'ngSecured.securityEnforcerProvider',
    '$windowProvider'
  ];

  function provider(localStorageServiceProvider,
                    $httpProvider,
                    authAdapterProvider,
                    permissionsDaoProvider,
                    securityEnforcerProvider,
                    $windowProvider) {

    var config = {
      adapterOptions: {},
      permissions: {
        url: ''
      },
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
      localStorageServiceProvider.setPrefix('ngSecured_'+ getAppPath() + '_');
      //authAdapterProvider.setup(config.adapterOptions);
      permissionsDaoProvider.setup(config.permissions);
      securityEnforcerProvider.setupPages(config.pages);
    };

    function getAppPath(){
      var $window = $windowProvider.$get();
      return $window.location.pathname;
    }

    this.$get = factory;

    factory.$inject = [
      'ngSecured.authAdapter',
      'ngSecured.permissionsDao',
      'ngSecured.securityEnforcer'
    ];

    function factory(authAdapter,
                     permissionsDao,
                     securityEnforcer) {

      var ngSecured = {};

      ngSecured.login = login;
      ngSecured.logout = logout;
      ngSecured.isLoggedIn = isLoggedIn;

      function login(credentials) {
        return authAdapter
          .login(credentials)
          .then(success);

        function success(response) {
          securityEnforcer.goToPostLoginPage();
          return response;
        }
      }

      function logout() {
        authAdapter.logout();
        permissionsDao.clear();
        securityEnforcer.goToPostLogoutPage();
      }

      function isLoggedIn() {
        return authAdapter.isLoggedIn();
      }

      return ngSecured;
    }

  }


})();

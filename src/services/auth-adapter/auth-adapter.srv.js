(function(){
  angular
    .module('ngSecured.services')
    .provider('ngSecured.authAdapter', provider);

  provider.$inject = [

  ];
  function provider(){

    var errorMessage = 'You must configure an authAdapter dependency';

    this.setup = setup;
    this.$get = srv;

    function setup(){
      throw new Error(errorMessage);
    }

    function srv(){

      var placeHolder = {};
      placeHolder.login = throwErrorFn;
      placeHolder.isLoggedIn = throwErrorFn;
      placeHolder.logout = throwErrorFn;

      function throwErrorFn(){
        throw new Error(errorMessage);
      }
    }

  }


})();

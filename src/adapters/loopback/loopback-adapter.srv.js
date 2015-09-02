(function(){
    angular
      .module('ngSecured.loopback')
      .provider('ngSecuredLoopback', provider);

  provider.$inject = [
    'ngSecured.authAdapterProvider',
    '$httpProvider'
  ];
  function provider(authAdapterProvider,
                    $httpProvider){

    this.setup = setup;

    function setup(config){
      authAdapterProvider.setup(config);
      $httpProvider.interceptors.push('ngSecured.tokenInterceptor');
    }

    this.$get = function(){

    }

  }
})();

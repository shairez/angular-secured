(function () {

  angular
    .module("ngSecured")
    .provider('ngSecured.httpManager', provider);


  provider.$inject = [
    '$httpProvider'
  ];
  function provider($httpProvider) {

    this.setupPages = setup;
    this.$get = factory;

    function setup(config) {
      setupTheInterceptor();
    }

    function setupTheInterceptor() {
      $httpProvider.interceptors.push(interceptor);

      interceptor.$inject = [
        "$injector",
        "$q"
      ];
      function interceptor($injector,
                           $q) {
        return {
          "request": requestHandler,
          "responseError": responseErrorHandler
        }

        function requestHandler(config){

        }

        function responseErrorHandler(error){
          return $q.reject(error);
        }

      };
    }
  }


  factory.$inject = [];
  function factory() {

    var httpManager = {};
    return httpManager;

  }

})();

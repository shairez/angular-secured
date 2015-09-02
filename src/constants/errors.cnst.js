(function(){
    angular
      .module('ngSecured.services')
      .constant('ngSecured.errorMessages',{
        WRONG_JSON_PATH: 'Json Path was not defined or is not correct, value was: ',
        NO_PERMISSIONS_URL: 'permissionUrl is not defined'


      });
})();

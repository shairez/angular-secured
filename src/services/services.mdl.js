angular.module('ngSecured.services', ['ui.router'])
  .run(['ngSecured.securityEnforcer', function(securityEnforcer){
    securityEnforcer.init();
  }]);

angular.module('ngSecured.services', ['ui.router'])
  .run(['ngSecured.pageGuard', function(pageGuard){
    pageGuard.init();
  }]);

(function(){

angular
  .module('mocks.localStorageService', [])
  .factory('localStorageService', function () {

             var mock = jasmine.createSpyObj('$localStorage',
               ['set',
                'get',
                'remove',
                'clearAll']);

             return mock;
           });
})();

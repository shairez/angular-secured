(function () {

  var uiRouterMockModule = angular.module('mocks.ui.router', []);

  uiRouterMockModule.provider('$state', function () {

    this.state = jasmine.createSpy('$stateProvider.state');

    var $stateMock = jasmine.createSpyObj('$state',['go']);

    this.$get = function () {
      return $stateMock
    }

  });

})();

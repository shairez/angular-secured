describe('UiRouter integration Test', function () {

  var $state,
    $rootScope,
    $stateProvider,
    fakeStateName1,
    fakeStateName2,
    fakeParams,
    fakeState1Config,
    fakeState2Config;

  beforeEach(module('ui.router'));

  beforeEach(module(function (_$stateProvider_) {
    $stateProvider = _$stateProvider_;
  }));

  beforeEach(inject(['$state',
                     '$rootScope',
                     function (_$state,
                               _$rootScope) {
                       $state = _$state;
                       $rootScope = _$rootScope;
                     }]));

  beforeEach(function () {
    fakeStateName1 = 'fakeState1';
    fakeStateName2 = 'fakeState2';
    fakeState1Config = {url: '/:id/'};
    fakeState2Config = {url: '/:item'};
    fakeParams1 = {id: '2'};
    fakeParams2 = {item: 'item'};
  });

  Given(function () {
    $stateProvider.state(fakeStateName1, fakeState1Config);
    $stateProvider.state(fakeStateName2, fakeState2Config);
  });

  describe('EVENT: $stateChangeStart', function () {

    describe('should return the proper params', function () {
      var event,
        toState,
        toParams,
        fromState,
        fromParams;


      Given(function () {
        $rootScope.$on('$stateChangeStart', function (_event, _toState, _toParams, _fromState, _fromParams) {
          event = _event;
          toState = _toState;
          toParams = _toParams;
          fromState = _fromState;
          fromParams = _fromParams;
        });
      });

      describe('when passing 2 states', function () {
        When(function () {
          $state.go(fakeStateName1, fakeParams1);
          $rootScope.$apply();
          $state.go(fakeStateName2, fakeParams2);
        });

        Then(function () {
          expect(event.preventDefault).not.toBeUndefined();
          expect(fromState.name).toBe(fakeStateName1);
          expect(toState.name).toBe(fakeStateName2);
          expect(fromParams).toEqual(fakeParams1);
          expect(toParams).toEqual(fakeParams2);

        });

        describe('Should pass added data', function () {
          Given(function () {
            fakeState2Config.data = {
              secured: true
            }
          });

          Then(function () {
            expect(toState.data.secured).toBeTruthy();
          });
        });
      });

      describe('When passing 1 state', function () {
        When(function () {
          $state.go(fakeStateName1, fakeParams1);
        });
        Then(function () {
          expect(fromState.name).toBe('');
        });
      });
    });
  });

  describe('PROPERTY: current', function () {

    When(function () {
      $state.go(fakeStateName1);
      $rootScope.$apply();
    });
    Then(function(){
      expect($state.current).toBe(fakeState1Config);
    });
  });
});

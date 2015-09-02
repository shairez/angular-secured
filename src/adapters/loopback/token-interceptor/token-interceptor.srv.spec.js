describe("loopback tokenInterceptor", function () {

  var tokenInterceptor,
    authAdapterMock;

  beforeEach(module('ngSecured.loopback',
                    'mocks.ngSecured.loopback.authAdapter'));


  beforeEach(inject([
    'ngSecured.tokenInterceptor',
    'ngSecured.authAdapter',
    function (_tokenInterceptor,
              _authAdapter) {
      authAdapterMock = _authAdapter;
      tokenInterceptor = _tokenInterceptor;
    }]));


  describe('METHOD: request', function () {
    var fakeConfig,
      fakeToken,
      returnedConfig;
    Given(function(){
      fakeToken = 'TOKENTOKEN';
      authAdapterMock.getToken.and.returnValue(fakeToken);
      fakeConfig = {headers: {}};
    });
    When(function(){
      returnedConfig = tokenInterceptor.request(fakeConfig);
    });
    Then(function(){
      expect(returnedConfig.headers['Authorization']).toBe(fakeToken);
    });

    describe('should not add header if token is not available', function () {
      Given(function(){
        authAdapterMock.getToken.and.returnValue(undefined);
      });
      Then(function(){
        expect(returnedConfig.headers.hasOwnProperty('Authorization')).toBeFalsy();
      });
    });
  });

});


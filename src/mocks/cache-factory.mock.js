(function () {


  angular
    .module('mocks.CacheFactory', [])
    .factory('CacheFactory', factory);

  function factory($q) {

    var spy = jasmine.createSpy('CacheFactory');

    spy.get = jasmine.createSpy('CacheFactory.get');

    var mock = jasmine.createSpyObj('Cache',
      ['put',
       'get',
       'destroy',
       'remove',
       'removeAll']);

    spy.andReturn(mock);
    return spy;
  }
})();

describe("ngPersistence", function () {

	var ngPersistence,
		dataStore,
		daoMock,
		dataStoreCoreFactorySpy,
		dateStoreCoreMock,
		restGatewayFactorySpy,
		restGatewayMock,
		clientRestAdapterFactorySpy,
		clientRestAdapterMock;

	beforeEach(module("ngPersistence",
		"mocks.ngPersistence.services.daoFactory",
		"mocks.ngPersistence.services.dataStoreCoreFactory",
		"mocks.ngPersistence.services.restGatewayFactory",
		"mocks.ngPersistence.clientRestAdapters.clientRestAdapterFactory"
	));

	beforeEach(inject(["ngPersistence",
		"ngPersistence.services.daoFactory",
		"ngPersistence.services.dataStoreCoreFactory",
		"ngPersistence.services.restGatewayFactory",
		"ngPersistence.clientRestAdapters.clientRestAdapterFactory",
		function (_ngPersistence,
		          daoFactory,
		          dataStoreCoreFactory,
		          restGatewayFactory,
		          clientRestAdapterFactory) {
			ngPersistence = _ngPersistence;

			dataStoreCoreFactorySpy = dataStoreCoreFactory;
			dateStoreCoreMock = dataStoreCoreFactorySpy();
			dataStoreCoreFactorySpy.reset();

			daoFactorySpy = daoFactory;
			daoMock = daoFactorySpy();
			daoFactorySpy.reset();

			restGatewayFactorySpy = restGatewayFactory;
			restGatewayMock = restGatewayFactorySpy();
			restGatewayFactorySpy.reset();

			clientRestAdapterFactorySpy = clientRestAdapterFactory;
			clientRestAdapterMock = clientRestAdapterFactorySpy();
			clientRestAdapterFactorySpy.reset();

		}]));

	describe("should create a data store", function () {
		var baseUrl,
			serverRestAdapter;

		Given(function () {
			baseUrl = "/api";
			serverRestAdapter = {};
		});
		When(function () {
			dataStore = ngPersistence.createDataStore(baseUrl, clientRestAdapterFactorySpy, serverRestAdapter)
		});
		Then(function () {
			expect(clientRestAdapterFactorySpy).toHaveBeenCalledWith(baseUrl);
			expect(dataStoreCoreFactorySpy).toHaveBeenCalledWith(restGatewayMock);
			expect(restGatewayFactorySpy).toHaveBeenCalledWith(clientRestAdapterMock, serverRestAdapter);
		});

		describe("dataStore should create a DAO", function () {
			When(function () {
				dao = dataStore.createDAO();
			});
			Then(function () {
				expect(daoFactorySpy).toHaveBeenCalled();
			});
		});
	});

});
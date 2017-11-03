mocha.setup('bdd');
let assert = chai.assert;

describe("WS connection", function() {

    it("Подключение к серверу", function(done) {
        try {
            assert.equal(connect(), true);
            done();
        } catch (e) { done(e) };
    });
});



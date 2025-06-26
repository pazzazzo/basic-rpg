jest.mock('../Server');
const Server = require('../Server');

describe('index file', () => {
    test('creates a new Server', () => {
        require('../index');
        expect(Server).toHaveBeenCalled();
    });
});

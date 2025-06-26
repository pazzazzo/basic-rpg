jest.mock('../Player');
const Server = require('../Server');
const Player = require('../Player');

describe('Server', () => {
    const server = new Server();
    test('constructor loads overworlds', () => {
        expect(server.overworlds.size).toBeGreaterThan(0);
        expect(server.database).toHaveProperty('players');
    });

    test('onNewPlayer exists', () => {
        expect(typeof server.onNewPlayer).toBe('function');
    });
});

jest.mock('../Player');
const Server = require('../Server');
const Player = require('../Player');

describe('Server', () => {
    test('constructor loads overworlds', () => {
        const server = new Server();
        expect(server.overworlds.size).toBeGreaterThan(0);
        expect(server.database).toHaveProperty('players');
    });

    test('onNewPlayer exists', () => {
        const server = new Server();
        expect(typeof server.onNewPlayer).toBe('function');
    });
});

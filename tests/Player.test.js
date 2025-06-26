const Player = require('../Player');
const { createFakeServer, createFakeOverworld } = require('./TestHelpers');

describe('Player', () => {
    test('constructor mounts player and joins room', () => {
        const server = createFakeServer();
        const world = createFakeOverworld('DemoRoom', server);
        server.database.players.user = { x: 0, y: 0, map: 'DemoRoom', skin: 'hero', isPlayer: true };
        const socket = { join: jest.fn(), emit: jest.fn(), to: jest.fn(() => ({ emit: jest.fn() })), on: jest.fn() };
        const player = new Player('user', socket, server);
        expect(player.username).toBe('user');
        expect(socket.join).toHaveBeenCalledWith('DemoRoom');
        expect(server.overworlds.get('DemoRoom').characters.get('user')).toBe(player);
    });

    test('toJSON contains player info', () => {
        const server = createFakeServer();
        const world = createFakeOverworld('DemoRoom', server);
        server.database.players.user = { x: 1, y: 2, map: 'DemoRoom', skin: 'hero', isPlayer: true };
        const socket = { join: jest.fn(), emit: jest.fn(), to: jest.fn(() => ({ emit: jest.fn() })), on: jest.fn() };
        const player = new Player('user', socket, server);
        const json = player.toJSON();
        expect(json.isPlayer).toBe(true);
        expect(json.username).toBe('user');
        expect(json.world).toBe('DemoRoom');
    });
});

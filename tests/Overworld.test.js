const Overworld = require('../Overworld');
const Person = require('../Person');
const { createFakeServer } = require('./TestHelpers');

describe('Overworld', () => {
    test('isSpaceTaken checks walls', () => {
        const server = createFakeServer();
        const world = new Overworld({ id: 'W1', characters: {}, walls: { '1,1': true }, portals: {} }, server);
        expect(world.isSpaceTaken(0, 1, 'right')).toBe(true);
    });

    test('addWall and removeWall modify walls', () => {
        const server = createFakeServer();
        const world = new Overworld({ id: 'W1', characters: {}, walls: {}, portals: {} }, server);
        world.addWall(2, 3);
        expect(world.walls['2,3']).toBe(true);
        world.removeWall(2, 3);
        expect(world.walls['2,3']).toBeUndefined();
    });

    test('moveWall moves an existing wall', () => {
        const server = createFakeServer();
        const world = new Overworld({ id: 'W1', characters: {}, walls: { '1,1': true }, portals: {} }, server);
        world.moveWall(1, 1, 'right');
        expect(world.walls['2,1']).toBe(true);
        expect(world.walls['1,1']).toBeUndefined();
    });

    test('usePortal moves person to destination overworld', () => {
        const server = createFakeServer();
        const destWorld = new Overworld({ id: 'dest', characters: {}, walls: {}, portals: {} }, server);
        server.overworlds.set('dest', destWorld);
        const world = new Overworld({ id: 'W1', characters: {}, walls: {}, portals: { '0,0': { dest: 'dest', x: 5, y: 5, direction: 'down' } } }, server);
        const person = new Person({ id: 'p', x: 0, y: 0 }, server).mount(world);
        world.usePortal(0, 0, 'down', person);
        expect(person.overworld).toBe(destWorld);
        expect(person.x).toBe(5);
        expect(person.y).toBe(5);
    });
});

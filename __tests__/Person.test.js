const Person = require('../Person');
const { createFakeServer, createFakeOverworld } = require('./TestHelpers');

describe('Person', () => {
    test('mount adds character to overworld', () => {
        const server = createFakeServer();
        const world = createFakeOverworld('DemoRoom', server);
        const person = new Person({ id: 'p1', x: 1, y: 2 }, server);
        person.mount(world);
        expect(world.characters.get('p1')).toBe(person);
        expect(world.walls['1,2']).toBe(true);
    });

    test('unmount removes character from overworld', () => {
        const server = createFakeServer();
        const world = createFakeOverworld('DemoRoom', server);
        const person = new Person({ id: 'p2', x: 1, y: 1 }, server).mount(world);
        person.unmount();
        expect(world.characters.has('p2')).toBe(false);
        expect(world.walls['1,1']).toBeUndefined();
        expect(person.overworld).toBeNull();
    });

    test('updatePosition changes coordinates', () => {
        const server = createFakeServer();
        const world = createFakeOverworld('DemoRoom', server);
        const person = new Person({ id: 'p3', x: 0, y: 0, facing: 'right' }, server).mount(world);
        person.updatePosition();
        expect(person.x).toBe(1);
        person.facing = 'down';
        person.updatePosition();
        expect(person.y).toBe(1);
    });

    test('toJSON returns basic data', () => {
        const server = createFakeServer();
        const world = createFakeOverworld('DemoRoom', server);
        const person = new Person({ id: 'p4', x: 3, y: 4 }, server).mount(world);
        const json = person.toJSON();
        expect(json).toEqual({
            id: 'p4',
            x: 3,
            y: 4,
            facing: 'down',
            src: './assets/none.png',
            world: 'DemoRoom'
        });
    });
});

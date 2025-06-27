const Overworld = require('../Overworld');

describe('Overworld wall management', () => {
  test('isSpaceTaken returns true when wall exists', () => {
    const world = new Overworld({_id: 'w1', walls: {'1,1': true}, characters:{}}, {});
    expect(world.isSpaceTaken(0, 1, 'right')).toBe(true);
  });

  test('addWall and removeWall toggle walls', () => {
    const world = new Overworld({_id: 'w1', walls: {}, characters:{}}, {});
    world.addWall(2, 3);
    expect(world.isSpaceTaken(1, 3, 'right')).toBe(true);
    world.removeWall(2, 3);
    expect(world.isSpaceTaken(1, 3, 'right')).toBe(false);
  });

  test('moveWall updates wall position', () => {
    const world = new Overworld({_id: 'w1', walls: {'1,1': true}, characters:{}}, {});
    world.moveWall(1, 1, 'down');
    expect(world.walls['1,1']).toBeUndefined();
    expect(world.walls['1,2']).toBe(true);
  });
});

describe('Overworld portals', () => {
  test('isPortal detects portal', () => {
    const world = new Overworld({_id: 'w1', portals: {'0,0': {dest:'w2'}}, characters:{}}, {});
    expect(world.isPortal(0, -1, 'down')).toEqual({dest:'w2'});
  });

  test('usePortal teleports person', () => {
    const destWorld = new Overworld({_id:'w2', characters:{}}, {});
    const server = { overworlds: new Map([['w2', destWorld]]) };
    const world = new Overworld({_id:'w1', portals: {'0,0': {x:5,y:5,dest:'w2', direction:'left'}}, characters:{}}, server);
    const person = { x:0, y:0, facing:'down', changeOverworld: jest.fn() };
    world.usePortal(0,0,'down', person);
    expect(person.x).toBe(5);
    expect(person.y).toBe(5);
    expect(person.facing).toBe('left');
    expect(person.changeOverworld).toHaveBeenCalledWith(destWorld);
  });
});

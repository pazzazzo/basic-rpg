const utils = require('../Utils');

describe('withGrid', () => {
  test('multiplies by 16', () => {
    expect(utils.withGrid(2)).toBe(32);
  });
});

describe('asGridCoord', () => {
  test('returns coordinates scaled by grid', () => {
    expect(utils.asGridCoord(1, 2)).toBe('16,32');
  });
});

describe('nextPosition', () => {
  test('moves left', () => {
    expect(utils.nextPosition(5, 5, 'left')).toEqual({ x: 4, y: 5 });
  });
  test('moves right', () => {
    expect(utils.nextPosition(5, 5, 'right')).toEqual({ x: 6, y: 5 });
  });
  test('moves up', () => {
    expect(utils.nextPosition(5, 5, 'up')).toEqual({ x: 5, y: 4 });
  });
  test('moves down', () => {
    expect(utils.nextPosition(5, 5, 'down')).toEqual({ x: 5, y: 6 });
  });
});

describe('oppositeDirection', () => {
  test('returns opposite for left', () => {
    expect(utils.oppositeDirection('left')).toBe('right');
  });
  test('returns opposite for right', () => {
    expect(utils.oppositeDirection('right')).toBe('left');
  });
  test('returns opposite for up', () => {
    expect(utils.oppositeDirection('up')).toBe('down');
  });
  test('returns up for down', () => {
    expect(utils.oppositeDirection('down')).toBe('up');
  });
});

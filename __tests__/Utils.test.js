const Utils = require('../Utils');

describe('Utils', () => {
    test('withGrid multiplies by 16', () => {
        expect(Utils.withGrid(2)).toBe(32);
    });

    test('asGridCoord formats coordinates', () => {
        expect(Utils.asGridCoord(1, 2)).toBe('16,32');
    });

    test('nextPosition moves left', () => {
        const pos = Utils.nextPosition(5, 5, 'left');
        expect(pos).toEqual({ x: 4, y: 5 });
    });

    test('nextPosition moves right', () => {
        const pos = Utils.nextPosition(5, 5, 'right');
        expect(pos).toEqual({ x: 6, y: 5 });
    });

    test('nextPosition moves up', () => {
        const pos = Utils.nextPosition(5, 5, 'up');
        expect(pos).toEqual({ x: 5, y: 4 });
    });

    test('nextPosition moves down', () => {
        const pos = Utils.nextPosition(5, 5, 'down');
        expect(pos).toEqual({ x: 5, y: 6 });
    });

    test('oppositeDirection returns inverse', () => {
        expect(Utils.oppositeDirection('left')).toBe('right');
        expect(Utils.oppositeDirection('right')).toBe('left');
        expect(Utils.oppositeDirection('up')).toBe('down');
        expect(Utils.oppositeDirection('down')).toBe('up');
    });
});

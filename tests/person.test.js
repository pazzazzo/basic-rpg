const Person = require('../Person');

describe('Person updatePosition', () => {
  const server = { io: { to: () => ({ emit: () => {} }) } };

  test('updates position based on facing', () => {
    const person = new Person({_id:'p1', x:0, y:0, facing:'up'}, server);
    person.updatePosition();
    expect(person.x).toBe(0);
    expect(person.y).toBe(-1);
  });
});

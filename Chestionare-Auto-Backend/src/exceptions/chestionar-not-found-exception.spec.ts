import { ChestionarNotFoundException } from './chestionar-not-found-exception';

describe('ChestionarNotFoundException', () => {
  it('should be defined', () => {
    expect(new ChestionarNotFoundException()).toBeDefined();
  });
});

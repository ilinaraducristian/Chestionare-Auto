import { InvalidTokenException } from './invalid-token-exception';

describe('InvalidTokenException', () => {
  it('should be defined', () => {
    expect(new InvalidTokenException()).toBeDefined();
  });
});

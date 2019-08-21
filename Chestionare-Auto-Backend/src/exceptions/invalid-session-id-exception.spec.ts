import { InvalidSessionIDException } from './invalid-session-id-exception';

describe('InvalidSessionIDException', () => {
  it('should be defined', () => {
    expect(new InvalidSessionIDException()).toBeDefined();
  });
});

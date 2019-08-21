import { InternalErrorException } from './internal-error-exception';

describe('InternalErrorException', () => {
  it('should be defined', () => {
    expect(new InternalErrorException()).toBeDefined();
  });
});

import { InvalidCategoryException } from './invalid-category-exception';

describe('InvalidCategoryException', () => {
  it('should be defined', () => {
    expect(new InvalidCategoryException()).toBeDefined();
  });
});

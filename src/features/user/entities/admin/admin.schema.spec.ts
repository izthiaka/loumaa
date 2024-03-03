import { Admin } from './admin.schema';

describe('AdminSchema', () => {
  it('should be defined', () => {
    expect(new Admin()).toBeDefined();
  });
});

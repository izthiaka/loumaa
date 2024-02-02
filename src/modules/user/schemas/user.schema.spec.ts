import { User } from './user.schema';

describe('UserSchema', () => {
  it('should be defined', () => {
    expect(new User()).toBeDefined();
  });
});

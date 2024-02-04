import { Role } from './role.schema';

describe('RoleSchema', () => {
  it('should be defined', () => {
    expect(new Role()).toBeDefined();
  });
});

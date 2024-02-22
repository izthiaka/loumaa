import { UserSession } from './user_session.schema';

describe('UserSessionSchema', () => {
  it('should be defined', () => {
    expect(new UserSession()).toBeDefined();
  });
});

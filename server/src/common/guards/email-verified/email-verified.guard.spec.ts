import { EmailVerifiedGuard } from './email-verified.guard';

describe('EmailVerifiedGuard', () => {
  it('should be defined', () => {
    expect(new EmailVerifiedGuard()).toBeDefined();
  });
});

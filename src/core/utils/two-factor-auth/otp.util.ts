import * as speakeasy from 'speakeasy';

export class OTP {
  generateOtp(): string {
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret().base32,
      encoding: 'base32',
    });
    return otp;
  }

  validateOtp(userOtp: string, storedOtp: string): boolean {
    return speakeasy.totp.verify({
      secret: storedOtp,
      encoding: 'base32',
      token: userOtp,
    });
  }
}

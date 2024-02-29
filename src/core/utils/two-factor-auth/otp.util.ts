import * as speakeasy from 'speakeasy';

interface OTPObject {
  code: string;
  secret: string;
}

export class OTP {
  generateOtp(): OTPObject {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `${process.env.APP_NAME}`,
      expireIn: 30 * 60,
    });
    const code = speakeasy.totp({
      secret: `${secret.base32}`,
      digits: 6,
      step: 60 * 30,
      encoding: 'base32',
    });
    const result: OTPObject = {
      code: code,
      secret: secret.base32,
    };

    return result;
  }

  validateOtp(code: string): boolean {
    const match = speakeasy.totp.verify({
      secret: 'IJJHKKSJONMD6S3BKJJHC23ZHFEVISBY',
      token: code,
      digits: 6,
      step: 60 * 30,
      encoding: 'base32',
      window: 6,
    });
    return match;

    // return speakeasy.totp.verify({
    //   secret: storedOtp,
    //   encoding: 'base32',
    //   token: userOtp,
    // });
  }
}

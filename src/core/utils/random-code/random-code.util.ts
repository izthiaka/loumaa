import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class RandomCodeUtil {
  generateCode(length: number): string {
    const characters = '0123456789';
    const characterCount = characters.length;

    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomBytes(1)[0] % characterCount;
      code += characters[randomIndex];
    }

    return code;
  }
}

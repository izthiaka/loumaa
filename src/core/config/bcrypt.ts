import * as bcrypt from 'bcrypt';

export default class BcryptImplement {
  saltRounds: number;
  constructor() {
    this.saltRounds = 10;
  }

  hash(string: string | Buffer) {
    const salt = bcrypt.genSaltSync(this.saltRounds);
    const stringHashed = bcrypt.hashSync(string, salt);
    return stringHashed;
  }

  compare(string: string | Buffer, stringHashed: string) {
    const verify = bcrypt.compareSync(string, stringHashed);
    return verify;
  }
}

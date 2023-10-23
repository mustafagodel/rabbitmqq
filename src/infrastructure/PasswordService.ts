import * as crypto from 'crypto';

import { injectable } from 'inversify';

@injectable()
export class PasswordService {
    hashPassword(password: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(password);
        return hash.digest('hex');
    }
}

export default PasswordService;

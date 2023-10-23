import { injectable } from 'inversify';

@injectable()
export class User {
    constructor(public username: string, public password: string) {}
}
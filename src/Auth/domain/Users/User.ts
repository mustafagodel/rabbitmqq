import { injectable } from 'inversify';

@injectable()
export class User {
    id: string | undefined;
    constructor(public username: string, public password: string) {}
}
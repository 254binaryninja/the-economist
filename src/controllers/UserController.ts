import { inject, injectable } from 'inversify';
import { TYPES } from '../config/types';
import type { IUserRepository, UserInsert, UserUpdate } from '../domain/repository/IUserRepository';

@injectable()
export class UserController {
    constructor(
        @inject(TYPES.IUserRepository) private userRepository: IUserRepository
    ) {}

    async findByUserId(user_id: string, token: string){
        await this.userRepository.setToken(token);
        return this.userRepository.findByUserId(user_id);
    }

    async findByEmail(email: string, token: string) {
        await this.userRepository.setToken(token);
        return this.userRepository.findByEmail(email);
    }

    async create(user: UserInsert, token: string) {
        await this.userRepository.setToken(token);
        return this.userRepository.create(user);
    }

    async update(id: string, user: UserUpdate, token: string) {
        await this.userRepository.setToken(token);
        return this.userRepository.update(id, user);
    }

    async delete(id: string, token: string) {
        await this.userRepository.setToken(token);
        return this.userRepository.delete(id);
    }
}
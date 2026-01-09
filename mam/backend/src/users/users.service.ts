import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

export class CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  tenantId: string;
  roleId: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: Record<string, any>;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    if (createUserDto.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    const { password, ...userData } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      ...userData,
      passwordHash,
    });

    return this.userRepository.save(user);
  }

  async findAll(tenantId?: string): Promise<User[]> {
    const where = tenantId ? { tenantId } : {};
    return this.userRepository.find({
      where,
      relations: ['tenant', 'role'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['tenant', 'role'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['tenant', 'role'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['tenant', 'role'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.findByUsername(updateUserDto.username);
      if (existingUsername && existingUsername.id !== id) {
        throw new ConflictException('Username already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }
}

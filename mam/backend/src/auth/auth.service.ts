import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { RolesService } from '../users/roles.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private rolesService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: User): Promise<AuthResponse> {
    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    return {
      user,
      tokens,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const tenant = await this.tenantsService.findBySlug(registerDto.tenantSlug);

    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedException('Invalid tenant');
    }

    let defaultRole = await this.rolesService.findBySlug('creator', tenant.id);
    if (!defaultRole) {
      defaultRole = await this.rolesService.findBySlug('creator');
    }

    if (!defaultRole) {
      throw new Error('Default role not found. Please run database seeding.');
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      username: registerDto.username,
      tenantId: tenant.id,
      roleId: defaultRole.id,
    });

    const fullUser = await this.usersService.findOne(user.id);
    const tokens = await this.generateTokens(fullUser);

    return {
      user: fullUser,
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid user');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return await this.usersService.findOne(payload.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roleId: user.roleId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 86400, // 1 day in seconds
    };
  }
}

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async check() {
    const dbHealth = await this.checkDatabase();

    const health = {
      status: dbHealth.status === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get('nodeEnv', 'development'),
      version: '1.0.0',
      database: dbHealth,
    };

    if (health.status === 'error') {
      throw new ServiceUnavailableException(health);
    }

    return health;
  }

  async checkReadiness() {
    // Check if service is ready to accept traffic
    // This includes database connectivity and critical dependencies
    const dbHealth = await this.checkDatabase();

    if (dbHealth.status !== 'connected') {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        reason: 'Database not connected',
      });
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  async checkLiveness() {
    // Check if service is alive
    // This is a simple check that the process is running
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  private async checkDatabase(): Promise<{
    status: string;
    responseTime?: number;
  }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        status: 'connected',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'disconnected',
      };
    }
  }
}

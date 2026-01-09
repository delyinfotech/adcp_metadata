import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-01-05T10:00:00.000Z' },
        uptime: { type: 'number', example: 123.45 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            responseTime: { type: 'number', example: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    return this.healthService.check();
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Check if service is ready to accept traffic' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readiness() {
    return this.healthService.checkReadiness();
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Check if service is alive' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  async liveness() {
    return this.healthService.checkLiveness();
  }
}

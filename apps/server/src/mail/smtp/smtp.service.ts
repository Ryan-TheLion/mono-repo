import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { type SmtpConfig, smtpConfig } from './smtp.config';

@Injectable({ scope: Scope.REQUEST })
export class SmtpService {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    @Inject(smtpConfig.KEY) private readonly config: SmtpConfig,
  ) {}
}

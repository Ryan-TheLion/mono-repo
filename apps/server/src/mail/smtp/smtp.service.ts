import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { type SmtpConfig, smtpConfig } from './smtp.config';
import { createTransport } from 'nodemailer';
import { EMAIL_PROTOCOLS_PORT } from '../port';
import { type SendMail, type SmtpServiceMethods } from './types';
import { type NodeMailerSendMailResponse } from './types/node-mailer';
import {
  nodeMailerCustomAuth,
  type NodeMailerCustomAuthMethodName,
} from './node-mailer-custom-auth';
import { MailCredentialDto } from '../dto/credential.dto';

@Injectable({ scope: Scope.REQUEST })
export class SmtpService {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    @Inject(smtpConfig.KEY) private readonly config: SmtpConfig,
  ) {}

  private get customAuth() {
    return nodeMailerCustomAuth;
  }

  private createTransporter({ user, token }: MailCredentialDto) {
    const transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      requireTLS: this.config.port === EMAIL_PROTOCOLS_PORT.smtp.submission,
      auth: {
        type: 'custom',
        user,
        pass: token,
        method: 'CUSTOM_XOAUTH2' satisfies NodeMailerCustomAuthMethodName,
      },
      customAuth: this.customAuth,
    });

    this.req.res!.on('close', () => {
      transporter.close();
    });

    return transporter;
  }

  getMailer(credential: MailCredentialDto): SmtpServiceMethods {
    const transporter = this.createTransporter(credential);

    return {
      sendMail: (options) =>
        this.sendMail(transporter, {
          ...options,
          from: credential.user,
        }),
    };
  }

  private sendMail: SendMail = async (transporter, options) => {
    return (await transporter.sendMail(options)) as NodeMailerSendMailResponse;
  };
}

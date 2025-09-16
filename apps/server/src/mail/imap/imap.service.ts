import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { type ImapConfig, imapConfig } from './imap.config';
import { type GetMails, type ImapServiceMethods } from './types';
import { AsyncImap } from './async';
import { MailCredentialDto } from '../dto';

@Injectable({ scope: Scope.REQUEST })
export class ImapService {
  constructor(
    @Inject(REQUEST) private readonly req: Request,
    @Inject(imapConfig.KEY) private readonly config: ImapConfig,
  ) {}

  private createImap = async (credential: MailCredentialDto) => {
    const config = this.config;

    const imapClient = await AsyncImap.connect(credential, config);

    this.req.res!.on('close', () => {
      imapClient.closeConnection();
    });

    return imapClient;
  };

  async getImapClient(
    credential: MailCredentialDto,
  ): Promise<ImapServiceMethods> {
    const imap = await this.createImap(credential);

    return {
      getMails: (mailBox, param) => {
        return this.getMails(imap, mailBox, param);
      },
    };
  }

  private getMails: GetMails = async (
    imap,
    mailBox,
    { query, criteria, markSeen } = {},
  ) => {
    return await imap.getMails(mailBox, {
      query,
      criteria,
      markSeen,
    });
  };
}

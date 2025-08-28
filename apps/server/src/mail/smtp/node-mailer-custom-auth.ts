import { AUTH_HEADER_TOKEN_TYPE } from 'src/common/types';
import { SMTP_AUTH_STATUS } from '../smtp-status';
import { type NodeMailerCustomAuthenticationHandler } from './types/node-mailer';
import type SMTPConnection from 'nodemailer/lib/smtp-connection';

export type NodeMailerCustomAuth = typeof nodeMailerCustomAuth;

export type NodeMailerCustomAuthMethodName = keyof NodeMailerCustomAuth;

class SmtpAuthError extends Error {
  status: number;

  code?: number;

  text: string;

  rawResponse: string;

  protected __isSmtpAuthError = true;

  constructor(commandResponse: SMTPConnection.CustomAuthenticationResponse) {
    const { status, code, text, response: rawResponse } = commandResponse;

    super(text);

    this.name = 'SmtpAuthError';

    this.status = status;
    this.code = code;
    this.text = text;
    this.rawResponse = rawResponse;
  }
}

export const isSmtpAuthError = (error: unknown): error is SmtpAuthError => {
  return (
    typeof error === 'object' && error !== null && '__isSmtpAuthError' in error
  );
};

export const nodeMailerCustomAuth = {
  CUSTOM_XOAUTH2: async (ctx) => {
    const { user, pass: token } = ctx.auth.credentials;

    const SOH = `\x01`;
    const END = `\x01\x01`;

    const authFormat = `user=${user}${SOH}auth=${AUTH_HEADER_TOKEN_TYPE.Bearer} ${token}${END}`;
    const saslXoauth2 = Buffer.from(authFormat, 'utf8').toString('base64');

    const command = `AUTH XOAUTH2 ${saslXoauth2}`;

    const commandResponse = await ctx.sendCommand(command);

    if (commandResponse.status === SMTP_AUTH_STATUS.SUCCESS) {
      return ctx.resolve();
    }

    return ctx.reject(new SmtpAuthError(commandResponse));
  },
} as const satisfies Record<string, NodeMailerCustomAuthenticationHandler>;

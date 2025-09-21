import { IsOptional } from 'class-validator';
import { type NodeMailerAddress } from '../smtp/types';
import { IsNodeMailerAddress } from '../smtp/validator';
import { IsNotEmptyString } from 'src/common/validator';
import { type NodeMailerSendMailResponse } from '../smtp/types/node-mailer';

export class SendMailRequestDto {
  @IsNodeMailerAddress()
  to: NodeMailerAddress.SingleOrArray;

  @IsOptional()
  @IsNodeMailerAddress()
  cc?: NodeMailerAddress.SingleOrArray;

  @IsOptional()
  @IsNodeMailerAddress()
  bcc?: NodeMailerAddress.SingleOrArray;

  @IsNotEmptyString()
  subject: string;

  @IsNotEmptyString()
  html: string;
}

export class SendMailResponseDto {
  messageId: NodeMailerSendMailResponse['messageId'];

  status: 'success' | 'partialAccepted' | 'rejected';

  accepted: NodeMailerSendMailResponse['accepted'];

  rejected: NodeMailerSendMailResponse['rejected'];
}

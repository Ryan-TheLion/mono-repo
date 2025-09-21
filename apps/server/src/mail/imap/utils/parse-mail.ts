import { simpleParser, type ParsedMail } from 'mailparser';
import { type Imap } from '../types';
import { addressObjectToEmailAddress } from './address';
import { getStream } from 'src/common/utils';

export const parseEmail = async (
  mailBox: Imap.MailBox,
  { stream, attrs }: Imap.SequenceMessage,
) => {
  const buffer = await getStream(stream);

  const parsedMail = await simpleParser(buffer.toString('utf8'));

  return receivedEmail({ mailBox, parsedMail, messageAttrs: attrs });
};

const receivedEmail = ({
  mailBox,
  parsedMail,
  messageAttrs,
}: {
  mailBox: Imap.MailBox;
  parsedMail: ParsedMail;
  messageAttrs: Imap.MessageAttributes;
}): Imap.ReceivedEmail => {
  const content: Imap.ReceivedEmail['content'] = (() => {
    if (parsedMail.html === false) {
      return {
        type: parsedMail.textAsHtml ? 'html' : 'text',
        source: parsedMail.textAsHtml || parsedMail.text || '',
      };
    }

    return {
      type: 'html',
      source: parsedMail.html,
    };
  })();

  const email: Imap.ReceivedEmail = {
    uid: messageAttrs.uid,
    mailBox,
    flags: messageAttrs.flags,
    messageId: parsedMail.messageId ?? '',
    from: addressObjectToEmailAddress(parsedMail.from!).single,
    to: addressObjectToEmailAddress(parsedMail.to!).array,
    ...(parsedMail.cc && {
      cc: addressObjectToEmailAddress(parsedMail.cc).array,
    }),
    ...(parsedMail.bcc && {
      bcc: addressObjectToEmailAddress(parsedMail.bcc).array,
    }),
    ...(parsedMail.replyTo && {
      replyTo: addressObjectToEmailAddress(parsedMail.replyTo).single,
    }),
    ...(parsedMail.inReplyTo && {
      inReplyTo: parsedMail.inReplyTo,
    }),
    ...(parsedMail.priority && { priority: parsedMail.priority }),
    subject: parsedMail.subject ?? '',
    content,
    timestamp: parsedMail.date
      ? parsedMail.date.getTime()
      : messageAttrs.date.getTime(),
    ...(parsedMail.references && { references: parsedMail.references }),
    attachments: parsedMail.attachments,
  };

  return email;
};

export type Initial = Pick<
  Express.Multer.File,
  'fieldname' | 'originalname' | 'mimetype' | 'stream'
>;

export type Staging = Initial & {
  key: string;
};

export type Uploaded = Omit<Staging, 'stream'> & { url: string };

export type WithoutStream<
  File extends Any | Express.Multer.File = Express.Multer.File,
> = Omit<File, 'stream'>;

export type Any = Initial | Staging | Uploaded;

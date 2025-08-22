import { OmitType } from '@nestjs/swagger';
import { ProfileEntity } from 'src/user/entity';

export class ProfileResponseDto extends OmitType(ProfileEntity, [
  'created_at',
]) {}

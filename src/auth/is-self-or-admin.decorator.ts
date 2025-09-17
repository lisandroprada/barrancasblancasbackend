import { SetMetadata } from '@nestjs/common';

export const IS_SELF_OR_ADMIN_KEY = 'isSelfOrAdmin';
export const IsSelfOrAdmin = () => SetMetadata(IS_SELF_OR_ADMIN_KEY, true);

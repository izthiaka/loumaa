import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const origins = ['http://localhost:3000'];

export const corsOptions: CorsOptions = {
  origin: origins,
};

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
//import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

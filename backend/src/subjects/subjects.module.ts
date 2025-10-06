import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService],
  imports: [PrismaModule],
})
export class SubjectsModule {}

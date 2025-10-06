import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { LecturesModule } from './lectures/lectures.module';
import { TestsModule } from './tests/tests.module';
import { GroupsModule } from './groups/groups.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, LecturesModule, TestsModule, GroupsModule, SubjectsModule, TeacherModule, StudentModule, AdminModule],
})
export class AppModule {}
import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  AdminInfo,
  BaseUserInfo,
  CreateUserDto,
  StudentInfo,
  TeacherInfo,
  UpdateUserDto,
} from './dto/users.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const adminLogin = 'admin@example.com';
    const adminPassword = 'Admin123!';
    const existingAdmin = await this.prisma.user.findUnique({
      where: { login: adminLogin },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.prisma.user.create({
        data: {
          login: adminLogin,
          password: hashedPassword,
          fullName: 'Default Admin',
          admin: {
            create: {},
          },
        },
      });
      console.log(`Admin user created with login: ${adminLogin}`);
    }
  }

  async getAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        login: true,
        createdAt: true,
        password: true,
        student: {
          select: {
            group: {
              select: {
                name: true,
              },
            },
          },
        },
        teacher: {
          select: {
            subjects: {
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const { login, password, fullName, role, subjectIds, groupId } =
      createUserDto;

    // Validate inputs
    if (!login || !password || !fullName || !role) {
      throw new BadRequestException(
        'Login, password, fullName, and role are required',
      );
    }

    if (role === 'student' && !groupId) {
      throw new BadRequestException('groupId is required for students');
    }

    // Validate groupId if role is student
    if (role === 'student') {
      const group = await this.prisma.group.findUnique({
        where: { id: groupId! },
      });
      if (!group) {
        throw new BadRequestException(
          `Group with ID ${groupId} does not exist`,
        );
      }
    }

    // Validate subjectIds if role is teacher
    if (role === 'teacher' && subjectIds && subjectIds.length > 0) {
      const subjects = await this.prisma.subject.findMany({
        where: { id: { in: subjectIds } },
      });
      if (subjects.length !== subjectIds.length) {
        throw new BadRequestException('One or more subject IDs are invalid');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        login,
        password: hashedPassword,
        fullName,
        teacher:
          role === 'teacher'
            ? {
                create: {
                  subjects: {
                    create: (subjectIds || []).map((subjectId) => ({
                      subject: { connect: { id: subjectId } },
                    })),
                  },
                },
              }
            : undefined,
        student:
          role === 'student' ? { create: { groupId: groupId! } } : undefined,
        admin: role === 'admin' ? { create: {} } : undefined,
      },
      include: {
        teacher: { include: { subjects: { include: { subject: true } } } },
        student: { include: { group: true } },
        admin: true,
      },
    });
  }

  async getUserInfo(
    userId: number,
    role: string,
  ): Promise<TeacherInfo | StudentInfo | AdminInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher: {
          include: {
            tests: {
              select: {
                id: true,
                subject: { select: { id: true, name: true } },
                title: true,
                description: true,
                uploadDate: true,
                questions: {
                  select: {
                    id: true,
                    testId: true,
                    text: true,
                    image: true,
                    type: true,
                    correct: true,
                  },
                },
              },
            },
            lectures: {
              select: {
                id: true,
                subject: { select: { id: true, name: true } },
                title: true,
                description: true,
                uploadDate: true,
              },
            },
            subjects: {
              include: { subject: { select: { id: true, name: true } } },
            },
          },
        },
        student: {
          include: {
            submissions: {
              select: {
                score: true,
                id: true,
                test: {
                  select: {
                    id: true,
                    subject: { select: { id: true, name: true } },
                    uploadDate: true,
                  },
                },
              },
            },
            group: {
              select: {
                id: true,
                name: true,
                subjects: {
                  select: {
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        teachers: {
                          select: {
                            teacher: {
                              select: {
                                id: true,
                                user: { select: { fullName: true } },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        admin: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const baseInfo: BaseUserInfo = {
      id: user.id,
      login: user.login,
      fullName: user.fullName,
      role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    switch (role) {
      case 'teacher':
        return {
          ...baseInfo,
          subjects: user.teacher?.subjects.map((s) => s.subject.name) ?? [],
          testsCount: user.teacher?.tests.length ?? 0,
          lecturesCount: user.teacher?.lectures.length ?? 0,
          tests:
            user.teacher?.tests.map((test) => ({
              ...test,
              subject: test.subject,
              uploadDate: test.uploadDate.toISOString(),
              questions: test.questions,
            })) ?? [],
          lectures:
            user.teacher?.lectures.map((lecture) => ({
              ...lecture,
              subject: lecture.subject,
              uploadDate: lecture.uploadDate.toISOString(),
            })) ?? [],
        };

      case 'student':
        const submissions = user.student?.submissions ?? [];
        const submissionsCount = submissions.length;
        const averageScore =
          submissionsCount > 0
            ? submissions.reduce((sum, sub) => sum + (sub.score ?? 0), 0) /
              submissionsCount
            : 0;

        return {
          ...baseInfo,
          group: user.student?.group?.name ?? 'No group',
          submissionsCount,
          averageScore,
          submissions: submissions.map((sub) => ({
            ...sub,
            test: {
              ...sub.test,
              uploadDate: sub.test.uploadDate.toISOString(),
            },
          })),
          subjects: user.student?.group?.subjects
            ? user.student.group.subjects.map((s) => ({
                id: s.subject.id,
                name: s.subject.name,
                teachers: s.subject.teachers.map((t) => ({
                  teacher: {
                    id: t.teacher.id,
                    user: { fullName: t.teacher.user.fullName },
                  },
                })),
              }))
            : [],
        };

      case 'admin':
        const [
          totalUsers,
          users,
          totalStudents,
          students,
          totalTeachers,
          teachers,
          totalGroups,
          groups,
          totalSubjects,
          subjects,
          totalTests,
          tests,
          totalLectures,
          lectures,
        ] = await Promise.all([
          this.prisma.user.count(),
          this.prisma.user.findMany({
            select: { id: true, fullName: true, login: true },
          }),
          this.prisma.student.count(),
          this.prisma.student.findMany({
            select: {
              id: true,
              user: { select: { id: true, fullName: true, login: true } },
              group: { select: { id: true, name: true } },
            },
          }),
          this.prisma.teacher.count(),
          this.prisma.teacher.findMany({
            select: {
              id: true,
              user: { select: { id: true, fullName: true, login: true } },
              subjects: {
                select: {
                  subject: { select: { id: true, name: true } },
                },
              },
            },
          }),
          this.prisma.group.count(),
          this.prisma.group.findMany({
            select: { id: true, name: true },
          }),
          this.prisma.subject.count(),
          this.prisma.subject.findMany({
            select: { id: true, name: true },
          }),
          this.prisma.test.count(),
          this.prisma.test.findMany({
            select: { id: true, subject: { select: { id: true, name: true } } },
          }),
          this.prisma.lecture.count(),
          this.prisma.lecture.findMany({
            select: { id: true, subject: { select: { id: true, name: true } } },
          }),
        ]);

        return {
          ...baseInfo,
          totalUsers,
          users,
          totalStudents,
          students,
          totalTeachers,
          teachers,
          totalGroups,
          groups,
          totalSubjects,
          subjects,
          totalTests,
          tests,
          totalLectures,
          lectures,
        };

      default:
        throw new BadRequestException('Invalid role');
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { login, password, fullName, role, subjectIds, groupId } =
      updateUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: {
        teacher: { include: { subjects: true } },
        student: true,
        admin: true,
      },
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    // Хэшируем пароль, если пришёл новый
    let hashedPassword: string | undefined = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        login: login ?? existingUser.login,
        password: hashedPassword ?? existingUser.password,
        fullName: fullName ?? existingUser.fullName,

        // если роль student
        student:
          role === 'student'
            ? {
                upsert: {
                  update: { groupId: groupId! },
                  create: { groupId: groupId! },
                },
              }
            : existingUser.student
              ? { delete: true }
              : undefined,

        // если роль teacher
        teacher:
          role === 'teacher'
            ? {
                upsert: {
                  update: {
                    subjects: {
                      deleteMany: {},
                      create: (subjectIds || []).map((id) => ({
                        subject: { connect: { id } },
                      })),
                    },
                  },
                  create: {
                    subjects: {
                      create: (subjectIds || []).map((id) => ({
                        subject: { connect: { id } },
                      })),
                    },
                  },
                },
              }
            : existingUser.teacher
              ? { delete: true }
              : undefined,

        // если роль admin
        admin:
          role === 'admin'
            ? { upsert: { update: {}, create: {} } }
            : existingUser.admin
              ? { delete: true }
              : undefined,
      },
      include: {
        teacher: { include: { subjects: { include: { subject: true } } } },
        student: { include: { group: true } },
        admin: true,
      },
    });
  }

  async deleteUser(userId: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}

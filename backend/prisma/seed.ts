import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cleanup existing data to avoid unique constraint violations
  await prisma.teacherSubject.deleteMany({});
  await prisma.groupSubject.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.subject.deleteMany({});

  // Create 5 teachers
  const teachers: { teacherId: number; fullName: string; login: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const fullName = `Teacher ${i}`;
    const login = `teacher${i}`;
    const password = '123123'; // In real app, hash this
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        login,
        password: hashedPassword,
        teacher: {
          create: {},
        },
      },
      include: { teacher: true },
    });

    teachers.push({ teacherId: user.teacher?.id || 1, fullName, login });
  }

  // Create 20 students
  const students: { userId: number; fullName: string; login: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const fullName = `Student ${i}`;
    const login = `student${i}`;
    const password = '123123'; // In real app, hash this
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        login,
        password: hashedPassword,
        student: {
          create: {},
        },
      },
      include: { student: true },
    });

    students.push({ userId: user.id, fullName, login });
  }

  const subjects: { id: number; name: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const subject = await prisma.subject.create({
      data: {
        name: `Subject ${i}`,
      },
    });
    subjects.push(subject);
  }

  const groups: { id: number; name: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const group = await prisma.group.create({
      data: {
        name: `Group ${i}`,
      },
    });
    groups.push(group);
  }

  // Assign students to groups (4 students per group)
  for (let g = 0; g < groups.length; g++) {
    const groupStudents = students.slice(g * 4, (g + 1) * 4);
    for (const student of groupStudents) {
      await prisma.student.update({
        where: { userId: student.userId },
        data: { groupId: groups[g].id },
      });
    }
  }

  for (let t = 0; t < teachers.length; t++) {
    const subjectIds = [subjects[t % 5].id, subjects[(t + 1) % 5].id];
    for (const subjectId of subjectIds) {
      await prisma.teacherSubject.create({
        data: {
          teacherId: teachers[t].teacherId,
          subjectId,
        },
      });
    }
  }

  // Assign groups to subjects (each group gets 2 subjects, cycling through)
  for (let g = 0; g < groups.length; g++) {
    const subjectIds = [subjects[g % 5].id, subjects[(g + 1) % 5].id];
    for (const subjectId of subjectIds) {
      await prisma.groupSubject.create({
        data: {
          groupId: groups[g].id,
          subjectId,
        },
      });
    }
  }

  console.log('Seeding completed:');
  console.log(`${teachers.length} teachers created`);
  console.log(`${students.length} students created`);
  console.log(`${subjects.length} subjects created`);
  console.log(`${groups.length} groups created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/auth.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // auth.service.ts
  async login(loginDto: LoginDto) {
    const { login, password } = loginDto;

    // Найти пользователя
    const user = await this.prisma.user.findUnique({
      where: { login },
      include: {
        teacher: {
          include: {
            subjects: true, // подтягиваем предмет
          },
        },
        student: true,
        admin: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Определить роль
    let role: string;
    if (user.admin) role = 'admin';
    else if (user.teacher) role = 'teacher';
    else if (user.student) role = 'student';
    else throw new UnauthorizedException('User has no role');

    // JWT
    const payload = { sub: user.id, login: user.login, role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        login: user.login,
        fullName: user.fullName,
        role,
        subjects: user.teacher?.subjects ?? null, // выводим предмет
      },
    };
  }

}
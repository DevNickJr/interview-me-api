import User, { IUser } from '@/modules/auth/auth.model';
import { signToken } from '@/utils/jwt';
import CustomError from '@/utils/CustomError';

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: IUser; token: string }> {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw CustomError.badRequest('Email already in use');
  }

  const user = await User.create({
    email: data.email,
    password: data.password,
    name: data.name,
    provider: 'local',
  });

  const token = signToken(user._id.toString());

  const userObj = user.toObject();
  delete (userObj as any).password;

  return { user: userObj as IUser, token };
}

export function loginUser(user: IUser): { user: IUser; token: string } {
  const token = signToken(user._id.toString());
  const userObj = user.toObject();
  delete (userObj as any).password;
  return { user: userObj as IUser, token };
}

import User, { IUser } from '../models/User';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}): Promise<{ user: IUser; token: string }> {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw ApiError.badRequest('Email already in use');
  }

  const user = await User.create({
    email: data.email,
    password: data.password,
    name: data.name,
    provider: 'local',
  });

  const token = signToken(user._id.toString());

  // Remove password from response
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

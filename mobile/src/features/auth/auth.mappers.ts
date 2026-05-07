import { LoginDTO, RegisterDTO } from './types';

export function toLoginPayload(input: LoginDTO): LoginDTO {
  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
}

export function toRegisterPayload(input: RegisterDTO): RegisterDTO {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
  };
}

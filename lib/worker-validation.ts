export interface Worker {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface CreateWorkerDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateWorkerDto {
  name?: string;
  email?: string;
  password?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export const validateWorkerForm = (data: Partial<CreateWorkerDto>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({
      field: 'name',
      message: 'Name must be at least 2 characters long'
    });
  }

  if (!data.email || !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address'
    });
  }

  if (!data.password && 'password' in data) { // Only validate password for new workers
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  } else if (data.password && data.password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters long'
    });
  }

  return errors;
};
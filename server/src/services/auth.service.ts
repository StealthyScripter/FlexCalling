import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { db } from './database.service';

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly JWT_EXPIRES_IN = '7d';

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData) {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingPhone = await db.getUserByPhone(data.phone);
    if (existingPhone) {
      throw new Error('User with this phone number already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await db.createUser({
        id: uuidv4(),  // ← Use it here
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        balance: 0,
        isVerified: false,
        });

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData) {
    // Find user by email
    const user = await db.getUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user by ID (for protected routes)
   */
  async getUserById(userId: string) {
    const user = await db.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();

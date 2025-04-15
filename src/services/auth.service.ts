import { AuthError } from '@supabase/supabase-js';
import { SupabaseConfig } from '../config/supabase';
import { tableNames } from '../constance';
import { BaseService } from '../core/BaseService';
import { NotFoundError, ValidationError } from '../core/ErrorHandler';
import { IUserModel } from '../types/model/user.type';
import { compare, hash } from 'bcrypt';

export class AuthService extends BaseService<IUserModel> {
      constructor() {
            super(SupabaseConfig.getClient(), tableNames.user);
      }

      /**
       * Authenticate a user with email and password
       * @param email -- string
       * @param password -- string
       * @returns user info -- IUserModel
       */
      async authenticate(email: string, password: string): Promise<IUserModel> {
            if (!email || !password) {
                  throw new ValidationError('Email and password are required');
            }

            //Find user
            const users = await this.findAll({
                  where: { email: email.toLocaleLowerCase() },
            });

            if (!users || users.length === 0) {
                  throw new AuthError('Invalid credentials');
            }

            const user = users[0];

            //Check if user is active
            if (!user.is_active) {
                  throw new AuthError('Account is disabled');
            }

            //Verify password
            const isPasswordValid = await compare(password, user.password);
            if (!isPasswordValid) {
                  throw new AuthError('Invalid credentials');
            }

            return user;
      }

      /**
       * Register a new user
       */
      async register(
            userData: Omit<IUserModel, 'id' | 'created_at' | 'updated_at' | 'is_active'>
      ): Promise<IUserModel> {
            if (!userData.email || !userData.password || !userData.username) {
                  throw new ValidationError('Email, password and username are required');
            }

            //check if email already exists
            const existingUser = await this.findAll({
                  where: { email: userData.email.toLowerCase() },
            });
            if (existingUser && existingUser.length > 0) {
                  throw new ValidationError('Email already exists');
            }

            const hashedPassword = await hash(userData.password, this.SALT_ROUNDS);

            // Create user
            const user = await this.create({
                  ...userData,
                  email: userData.email.toLowerCase(),
                  password: hashedPassword,
                  is_active: true,
            });

            return user;
      }
      /**
       * Change user password
       */
      async changePassword(
            userId: number,
            currentPassword: string,
            newPassword: string
      ): Promise<void> {
            const user = await this.findById(userId);
            if (!user) {
                  throw new NotFoundError('User not found');
            }

            // Verify current password
            const isPasswordValid = await compare(currentPassword, user.password);
            if (!isPasswordValid) {
                  throw new AuthError('Current password is incorrect');
            }

            const hashedPassword = await hash(newPassword, this.SALT_ROUNDS);

            // Update password
            await this.update(userId, { password: hashedPassword });
      }

      /**
       * Update user profile
       */
      async updateProfile(
            userId: number,
            data: Partial<Omit<IUserModel, 'id' | 'password' | 'created_at' | 'updated_at'>>
      ): Promise<IUserModel> {
            const user = await this.findById(userId);
            if (!user) throw new NotFoundError('User not found');

            return await this.update(userId, data);
      }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateUserInput, UpdateUserInput } from './user-inputs.dto';
import { User, UserDocument } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  // Create a new user
  async createUser(createUserInput: CreateUserInput): Promise<User> {
    try {
      const { password, email } = createUserInput;

      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email }).exec();
      if (existingUser) {
        throw new GraphQLError('User with this email already exists.');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
      const newUser = new this.userModel({
        ...createUserInput,
        password: hashedPassword,
      });

      return await newUser.save();
    } catch (error) {
      console.error('Error creating user:', error);
      throw new GraphQLError('Failed to create user.');
    }
  }

  // Login a user
  async login(email: string, password: string): Promise<string> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new GraphQLError('Invalid email or password.');
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new GraphQLError('Invalid email or password.');
      }

      // Generate JWT token
      const payload = { userId: user._id, email: user.email };
      return this.jwtService.sign(payload);
    } catch (error) {
      console.error('Error during login:', error);
      throw new GraphQLError('Login failed.');
    }
  }

  // Find all users
  async findAllUsers(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new GraphQLError('Failed to retrieve users.');
    }
  }

  // Update user details
  async updateUser(
    userId: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { $set: updateUserInput }, { new: true })
        .exec();
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new GraphQLError('Failed to update user');
    }
  }

  // Update user password
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<string> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new GraphQLError('User not found');
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new GraphQLError('Current password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return 'Password updated successfully';
    } catch (error) {
      console.error('Error updating password:', error);
      throw new GraphQLError('Failed to update password');
    }
  }

  // Find user by id
  async findOne(_id: string | Types.ObjectId): Promise<User> {
    const userId = typeof _id === 'string' ? new Types.ObjectId(_id) : _id;
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new GraphQLError('User not found');
    }
    return user;
  }

  // Remove user
  async removeUser(_id: string): Promise<void> {
    try {
      const result = await this.userModel.findByIdAndDelete(_id);
    } catch (error) {
      console.error('Error in removeUser service:', error);
      throw new Error('Failed to remove user');
    }
  }
}

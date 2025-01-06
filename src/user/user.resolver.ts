import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import {
  CreateUserInput,
  UpdatePasswordInput,
  UpdateUserInput,
} from './user-inputs.dto';
import {  UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './user.guard';
import { Types } from 'mongoose';
import { GraphQLError } from 'graphql';
import { currentUser } from './user.decorator';


@Resolver(() => User)
export class UserResolver {
  constructor(private readonly us: UserService) {}
  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    try {
      return await this.us.createUser(createUserInput);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new GraphQLError('Failed to create user');
    }
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    try {
      return await this.us.login(email, password);
    } catch (error) {
      console.error('Error during login:', error);
      throw new GraphQLError('Login failed');
    }
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  async findAllUsers(): Promise<User[]> {
    try {
      return await this.us.findAllUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new GraphQLError('Failed to retrieve users');
    }
  }

  @Mutation(() => User)
  async updateUser(
    @Args('userId') userId: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    try {
      return await this.us.updateUser(userId, updateUserInput);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new GraphQLError('Failed to update user');
    }
  }

  @Mutation(() => String)
  async updatePassword(
    @Args('userId') userId: string,
    @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordInput,
  ): Promise<string> {
    const { currentPassword, newPassword } = updatePasswordInput;
    return this.us.updatePassword(userId, currentPassword, newPassword);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async findOne(
    @Args('_id', { type: () => String }) _id: Types.ObjectId,
  ): Promise<User> {
    try {
      return await this.us.findOne(_id);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new GraphQLError('Failed to retrieve user');
    }
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async removeUser(@Args('_id') _id: string): Promise<void> {
    try {
      return await this.us.removeUser(_id);
    } catch (error) {
      console.error('Error removing user:', error);
      throw new GraphQLError('Failed to remove user'); // Throws a GraphQLError to inform the client
    }
  }

  // BONUS: currentUser
  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async currentUser(@currentUser() user:User): Promise<User> {
    try {
      return await this.us.findOne(user._id)
    } catch (error) {
      throw new GraphQLError('Failed to fetch current user'); // Throws a GraphQLError to inform the client
    }
  }

}

import { Field, InputType, OmitType, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateUserInput{

    @Field()
    firstName: string

    @Field()
    lastName: string

    @Field()
    email: string

    @Field()
    password: string

    @Field()
    createdAt: string = new Date().toISOString()
}

@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['createdAt', 'password'] as const),
) {}

@InputType()
export class UpdatePasswordInput {
  @Field()
  currentPassword: string;

  @Field()
  newPassword: string;
}
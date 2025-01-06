import { ExecutionContext, Injectable, UnauthorizedException  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  // Explicitly typing the parameters
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new UnauthorizedException('JWT token is invalid or expired');
    }
    return user;  // Pass the authenticated user to the request context
  }


}

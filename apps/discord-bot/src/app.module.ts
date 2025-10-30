// apps/discord-bot/src/app.module.ts
// Root NestJS module combining GraphQL for public access and tRPC for
// authenticated internal calls.

import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { AppResolver } from './app.resolver'
import { AppService } from './app.service'
import { TrpcModule } from './trpc/trpc.module'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      playground: true,
    }),
    TrpcModule,
  ],
  providers: [AppResolver, AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AssignRole } from './application/use-cases/assign-role.use-case';
import { SyncCurrentUser } from './application/use-cases/sync-current-user.use-case';
import { UpdateProfile } from './application/use-cases/update-profile.use-case';
import { IdentityProvider } from './domain/ports/identity-provider.port';
import { UserRepository } from './domain/ports/user.repository';
import { FirebaseIdentityProvider } from './infrastructure/firebase-identity.provider';
import { FirestoreUserRepository } from './infrastructure/firestore-user.repository';
import { MeController } from './presentation/controllers/me.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { AuthenticationGuard } from './presentation/guards/authentication.guard';
import { AuthorizationGuard } from './presentation/guards/authorization.guard';

@Module({
    controllers: [MeController, UsersController],
    providers: [
        SyncCurrentUser,
        UpdateProfile,
        AssignRole,
        { provide: UserRepository, useClass: FirestoreUserRepository },
        { provide: IdentityProvider, useClass: FirebaseIdentityProvider },
        { provide: APP_GUARD, useClass: AuthenticationGuard },
        { provide: APP_GUARD, useClass: AuthorizationGuard },
    ],
})
export class IdentityModule {}

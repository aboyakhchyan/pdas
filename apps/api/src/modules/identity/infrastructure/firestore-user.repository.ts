import { Injectable } from '@nestjs/common';
import { type CollectionReference, Firestore } from 'firebase-admin/firestore';
import { User } from '../domain/entities/user.entity';
import { UserRepository } from '../domain/ports/user.repository';
import { userRecordSchema } from './records/user.record';

@Injectable()
export class FirestoreUserRepository extends UserRepository {
    private readonly users: CollectionReference;

    constructor(firestore: Firestore) {
        super();
        this.users = firestore.collection('users');
    }

    async findById(id: string): Promise<User | null> {
        const snapshot = await this.users.doc(id).get();
        if (!snapshot.exists) return null;
        return User.restore({ id, ...userRecordSchema.parse(snapshot.data()) });
    }

    async save(user: User): Promise<void> {
        const { id, ...record } = user.toProps();
        await this.users.doc(id).set(record);
    }
}

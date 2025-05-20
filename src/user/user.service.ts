import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(userData: Partial<User>): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password!, 10);
        const user = new this.userModel({ ...userData, password: hashedPassword });
        return user.save();
    }

    async getAllUsers(): Promise<Omit<User, 'password'>[]> {
        const users = await this.userModel.find().select('-password').exec(); // Exclude password field
        return users;
    }

    async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.userModel.findOne({ _id: id }).select('-password').exec(); // Exclude password field
        return user;
    }

    async createAdminIfNotExists() {
        const existingAdmin = await this.userModel.findOne({ role: 'admin' }).exec();
        if (!existingAdmin) {
            console.log('No admin found, creating default admin user...');
            await this.create({
                name: 'Admin',
                email: 'admin@postsprint.com',
                password: 'abc123@I', // You should hash this and consider using env variables
                role: 'admin',
            });
        } else {
            console.log('Admin user already exists, skipping...');
        }
    }

    async getUserByEmailRaw(email: string): Promise<User | null> {
        const userDoc = await this.userModel.findOne({ email }).exec();
        return userDoc ? userDoc.toObject() : null;
    }
}

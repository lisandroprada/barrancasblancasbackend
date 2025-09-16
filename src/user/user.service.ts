import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    const existingUser = await this.userModel.findById(id).exec();
    if (!existingUser) {
      return null;
    }

    // Create an object to hold the fields to update
    const fieldsToUpdate: any = { ...updateUserDto }; // Start with DTO fields

    if (updateUserDto.password) {
      fieldsToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Apply DTO fields to a temporary object to recalculate profileComplete
    // This is important because existingUser might not have all DTO fields yet
    const tempUserForProfileCheck = { ...existingUser.toObject(), ...fieldsToUpdate };

    // Recalculate profileComplete based on the combined data
    fieldsToUpdate.profileComplete = this.isProfileComplete(tempUserForProfileCheck as UserDocument);

    // Use findByIdAndUpdate to perform the update atomically
    return this.userModel
      .findByIdAndUpdate(id, { $set: fieldsToUpdate }, { new: true })
      .exec();
  }

  private isProfileComplete(user: UserDocument): boolean {
    // Define the fields that must be present for a profile to be considered complete
    const requiredFields = [
      'phone',
      'dni',
      'birthDate',
      'address',
      'city',
      'province',
      'zipCode',
      'occupation',
      'monthlyIncome',
      'investmentExperience',
      'preferredContactMethod',
      'interestedLotSize',
      'budget',
      'timeline',
    ];

    for (const field of requiredFields) {
      // Check if the field exists and is not null, undefined, or an empty string
      if (!user[field] || user[field].toString().trim() === '') {
        return false;
      }
    }
    return true;
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async findAssignableUsers(): Promise<UserDocument[]> {
    return this.userModel.find({ roles: { $in: ['admin', 'vendedor'] } }).exec();
  }
}

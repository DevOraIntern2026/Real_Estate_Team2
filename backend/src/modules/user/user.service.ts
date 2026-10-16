import { Types } from "mongoose";
import { UserRepo } from "../../DB/repo";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions";
import { decrypt } from "../../common/utils/security";
import { RoleEnum, RoleLabel } from "../../common/enums";
import { uploadBufferToCloudinary } from "../../common/utils/cloudinary";
import { redisService, RedisService } from "../../common/services";

class UserService {
  private readonly userRepo: UserRepo;
  private readonly redis: RedisService;
  constructor() {
    this.userRepo = new UserRepo();
    this.redis = redisService;
  }
  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      filter: { _id: new Types.ObjectId(userId) },
    });
    if (!user) throw new NotFoundException("User not found");
    let phone = user.phone;
    if (phone) {
      try {
        phone = await decrypt(phone);
      } catch {
        // Plaintext fallback
      }
    }
    const isAgent = user.role === RoleEnum.AGENT;
    return {
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: phone || "",
      avatar: user.profileImage || "",
      profileImage: user.profileImage || "",
      location: user.location || "",
      bio: user.bio || "",
      role: RoleLabel[user.role] || "user",
      ...(isAgent
        ? {
            licenseNumber: user.licenseNumber || "",
            agencyName: user.agencyName || "",
          }
        : {}),
    };
  }
  async updateMe(
    userId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      bio?: string;
      licenseNumber?: string;
      agencyName?: string;
    },
  ) {
    const user = await this.userRepo.findOne({
      filter: { _id: new Types.ObjectId(userId) },
    });
    if (!user) throw new NotFoundException("User not found");

    if (data.email && data.email !== user.email) {
      const exists = await this.userRepo.findOne({
        filter: { email: data.email, _id: { $ne: user._id } },
        projection: "_id",
      });
      if (exists) throw new ConflictException("Email already taken");
      user.email = data.email;
    }

    if (data.name) {
      const parts = data.name.trim().split(" ");
      user.firstName = parts[0] || user.firstName;
      user.lastName = parts.slice(1).join(" ") || user.lastName;
    }

    if (data.phone) {
      user.phone = data.phone;
    }

    if (data.location !== undefined) {
      user.location = data.location;
    }

    if (data.bio !== undefined) {
      user.bio = data.bio;
    }

    if (data.licenseNumber !== undefined) {
      user.licenseNumber = data.licenseNumber;
    }

    if (data.agencyName !== undefined) {
      user.agencyName = data.agencyName;
    }

    await user.save();
    return this.getMe(userId);
  }
  async updatePhoto(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No image file provided");
    const uploaded = await uploadBufferToCloudinary({
      buffer: file.buffer,
      folder: "devora/real-estate/users",
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    await this.userRepo.updateOne({
      filter: { _id: new Types.ObjectId(userId) },
      update: { profileImage: uploaded.secure_url },
    });
    return { avatar: uploaded.secure_url };
  }
  async deletePhoto(userId: string) {
    await this.userRepo.updateOne({
      filter: { _id: new Types.ObjectId(userId) },
      update: { profileImage: null },
    });
    return { avatar: null };
  }
  async deleteMe(userId: string) {
    await this.userRepo.updateOne({
      filter: { _id: new Types.ObjectId(userId) },
      update: { deletedAt: new Date() },
    });
    const tokenKeys = await this.redis.redisKeys(
      this.redis.redisBaseRevokeTokenKey(new Types.ObjectId(userId)),
    );
    if (tokenKeys.length) await this.redis.redisDelKeys(tokenKeys);
    return { success: true };
  }
}
export default new UserService();

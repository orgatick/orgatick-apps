import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { UserDevice } from "../entities/user-device.entity";

export interface RegisterDeviceDto {
  deviceIdentifier: string;
  name?: string | null;
  platform?: string | null;
}

@Injectable()
export class UserDeviceService {
  constructor(
    @InjectRepository(UserDevice)
    private readonly userDeviceRepository: Repository<UserDevice>,
  ) {}

  /** * Registers a new user device or updates lastSeenAt and metadata for an existing device. */
  async registerOrUpdateDevice(userId: string | number, dto: RegisterDeviceDto): Promise<UserDevice> {
    const strUserId = String(userId);
    let device = await this.userDeviceRepository.findOne({
      where: {
        userId: strUserId,
        deviceIdentifier: dto.deviceIdentifier,
      },
    });

    if (device) {
      device.lastSeenAt = new Date();
      if (dto.name) device.name = dto.name;
      if (dto.platform) device.platform = dto.platform;
    } else {
      device = this.userDeviceRepository.create({
        userId: strUserId,
        deviceIdentifier: dto.deviceIdentifier,
        name: dto.name ?? null,
        platform: dto.platform ?? null,
        lastSeenAt: new Date(),
      });
    }
    return await this.userDeviceRepository.save(device);
  }

  /** * Returns all registered devices for a given user. */
  async getUserDevices(userId: string | number): Promise<UserDevice[]> {
    return await this.userDeviceRepository.find({
      where: { userId: String(userId) },
      order: { lastSeenAt: "DESC" },
    });
  }

  /** * Returns a specific device by ID for a given user. */
  async getDeviceById(id: string | number, userId: string | number): Promise<UserDevice> {
    const device = await this.userDeviceRepository.findOne({
      where: { id: String(id), userId: String(userId) },
    });
    if (!device) throw new NotFoundException("Device not found");
    return device;
  }

  /** * Removes a device for a user. */
  async removeDevice(id: string | number, userId: string | number): Promise<void> {
    const device = await this.getDeviceById(id, userId);
    await this.userDeviceRepository.remove(device);
  }
}

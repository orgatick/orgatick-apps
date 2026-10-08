import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import {
  toNewsletterListResponse,
  type CreateNewsletterListDto,
  type NewsletterListResponse,
  type UpdateNewsletterListDto,
} from "@orgatick/contracts";
import { NewsletterList } from "../entities/newsletter-list.entity";
import { NewsletterListRepository } from "../repositories/newsletter-list.repository";

@Injectable()
export class NewsletterListService {
  constructor(private readonly listRepository: NewsletterListRepository) {}

  async findLists(): Promise<NewsletterListResponse[]> {
    const [lists, counts] = await Promise.all([this.listRepository.findAll(), this.listRepository.countsByList()]);

    return lists.map((list) => toNewsletterListResponse(list, counts.get(String(list.id)) ?? 0));
  }

  async findOne(id: bigint): Promise<NewsletterListResponse> {
    const list = await this.requireList(id);
    const counts = await this.listRepository.countsByList();
    return toNewsletterListResponse(list, counts.get(String(list.id)) ?? 0);
  }

  async createList(dto: CreateNewsletterListDto): Promise<NewsletterListResponse> {
    if (dto.slug && (await this.listRepository.findBySlug(dto.slug))) {
      throw new BadRequestException(`A list with slug '${dto.slug}' already exists`);
    }

    const created = await this.listRepository.create(dto);

    if (dto.makeDefault) {
      await this.listRepository.makeDefault(created.id);
      created.isDefault = true;
    }

    return toNewsletterListResponse(created, 0);
  }

  async updateList(id: bigint, dto: UpdateNewsletterListDto): Promise<NewsletterListResponse> {
    const list = await this.listRepository.update(id, dto);
    if (!list) {
      throw new NotFoundException("Mailing list not found");
    }

    if (dto.makeDefault) {
      await this.listRepository.makeDefault(id);
      list.isDefault = true;
    }

    const counts = await this.listRepository.countsByList();
    return toNewsletterListResponse(list, counts.get(String(list.id)) ?? 0);
  }

  async deleteList(id: bigint): Promise<void> {
    const list = await this.requireList(id);
    if (list.isDefault) {
      throw new BadRequestException("The default mailing list cannot be deleted");
    }
    await this.listRepository.remove(id);
  }

  async requireDefaultList(): Promise<NewsletterList> {
    const list = await this.listRepository.findDefault();
    if (!list) {
      throw new ServiceUnavailableException("No mailing list is configured");
    }
    return list;
  }

  async requireList(id: bigint): Promise<NewsletterList> {
    const list = await this.listRepository.findById(id);
    if (!list) {
      throw new NotFoundException("Mailing list not found");
    }
    return list;
  }

  async resolveList(identifier?: string | null): Promise<NewsletterList> {
    if (!identifier) {
      return this.requireDefaultList();
    }

    const bySlug = await this.listRepository.findBySlug(identifier);
    if (bySlug) return bySlug;

    try {
      const byId = await this.listRepository.findById(BigInt(identifier));
      if (byId) return byId;
    } catch {
      // not a bigint id
    }

    return this.requireDefaultList();
  }
}

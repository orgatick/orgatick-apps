//TODO: IN zod orgatick contract
export class LoginAttemptQueryDto {
  page!: number;
  limit!: number;
  startDate?: Date;
  endDate?: Date;
  sortOrder?: "ASC" | "DESC" | "asc" | "desc";
}

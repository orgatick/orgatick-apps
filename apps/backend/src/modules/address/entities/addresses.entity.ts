import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AdministrativeDivision } from "./administrative-divisions.entity";
import { City } from "./cities.entity";
import { Country } from "./countries.entity";

@Entity("addresses", { schema: "address" })
@Index("IDX_addresses_country_id", ["countryId"])
@Index("IDX_addresses_division_id", ["divisionId"])
@Index("IDX_addresses_city_id", ["cityId"])
@Index("IDX_addresses_postal_code", ["postalCode"])
export class Address {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "uuid", unique: true, default: () => "gen_random_uuid()" })
  uuid!: string;

  @Column({ name: "country_id", type: "bigint" })
  countryId!: bigint;

  @Column({ name: "division_id", type: "bigint", nullable: true })
  divisionId?: bigint | null;

  @Column({ name: "city_id", type: "bigint", nullable: true })
  cityId?: bigint | null;

  @Column({ name: "area_id", type: "bigint", nullable: true })
  areaId?: bigint | null;

  @Column({ name: "address_line_1", type: "varchar", length: 255 })
  addressLine1!: string;

  @Column({ name: "address_line_2", type: "varchar", length: 255, nullable: true })
  addressLine2?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  landmark?: string | null;

  @Column({ name: "postal_code", type: "varchar", length: 50, nullable: true })
  postalCode?: string | null;

  @Column({ type: "decimal", precision: 10, scale: 7, nullable: true })
  latitude?: number | null;

  @Column({ type: "decimal", precision: 11, scale: 7, nullable: true })
  longitude?: number | null;

  @Column({ name: "formatted_address", type: "varchar", length: 500, nullable: true })
  formattedAddress?: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Country,
    (country) => country.addresses,
    {
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "country_id" })
  country!: Country;

  @ManyToOne(
    () => AdministrativeDivision,
    (division) => division.addresses,
    {
      nullable: true,
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "division_id" })
  division?: AdministrativeDivision | null;

  @ManyToOne(
    () => City,
    (city) => city.addresses,
    {
      nullable: true,
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "city_id" })
  city?: City | null;
}

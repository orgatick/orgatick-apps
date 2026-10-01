import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { AdministrativeDivision } from "./administrative-divisions.entity";
import { Country } from "./countries.entity";
import { Address } from "./addresses.entity";

@Entity({ name: "cities", schema: "address" })
@Unique("UQ_cities_geoname_id", ["geonameId"])
@Index("IDX_cities_country_id", ["countryId"])
@Index("IDX_cities_admin1_id", ["admin1Id"])
@Index("IDX_cities_admin2_id", ["admin2Id"])
@Index("IDX_cities_name", ["name"])
@Index("IDX_cities_name_ascii", ["nameAscii"])
@Index("IDX_cities_slug", ["slug"])
export class City {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "geoname_id", type: "bigint", unique: true })
  geonameId!: number;

  @Column({ name: "country_id", type: "bigint" })
  countryId!: bigint;

  @Column({ name: "admin1_id", type: "bigint", nullable: true })
  admin1Id?: bigint | null;

  @Column({ name: "admin2_id", type: "bigint", nullable: true })
  admin2Id?: bigint | null;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ name: "name_ascii", type: "varchar", length: 150 })
  nameAscii!: string;

  @Column({ type: "varchar", length: 180, nullable: true })
  slug?: string | null;

  @Column({ type: "decimal", precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: "decimal", precision: 11, scale: 7 })
  longitude!: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  timezone?: string | null;

  @Column({ name: "modification_date", type: "date", nullable: true })
  modificationDate?: Date | string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Country,
    (country) => country.cities,
    {
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "country_id" })
  country!: Country;

  @ManyToOne(() => AdministrativeDivision, {
    nullable: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "admin1_id" })
  admin1?: AdministrativeDivision | null;

  @ManyToOne(() => AdministrativeDivision, {
    nullable: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "admin2_id" })
  admin2?: AdministrativeDivision | null;

  @OneToMany(
    () => Address,
    (address) => address.city,
  )
  addresses?: Address[];
}

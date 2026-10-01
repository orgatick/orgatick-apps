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
import { Country } from "./countries.entity";
import { Address } from "./addresses.entity";

@Entity("administrative_divisions", { schema: "address" })
@Unique("UQ_administrative_divisions_geoname_id", ["geonameId"])
@Unique("UQ_administrative_divisions_country_level_code", ["countryId", "level", "code"])
@Index("IDX_administrative_divisions_country_id", ["countryId"])
@Index("IDX_administrative_divisions_parent_id", ["parentId"])
@Index("IDX_administrative_divisions_level", ["level"])
@Index("IDX_administrative_divisions_name", ["name"])
export class AdministrativeDivision {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "country_id", type: "bigint" })
  countryId!: bigint;

  @Column({ name: "parent_id", type: "bigint", nullable: true })
  parentId?: bigint | null;

  @Column({ type: "smallint" })
  level!: number;

  @Column({ type: "varchar", length: 20 })
  code!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ name: "name_ascii", type: "varchar", length: 150 })
  nameAscii!: string;

  @Column({ name: "geoname_id", type: "bigint", unique: true })
  geonameId!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Country,
    (country) => country.administrativeDivisions,
    {
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "country_id" })
  country!: Country;

  @ManyToOne(
    () => AdministrativeDivision,
    (division) => division.children,
    {
      nullable: true,
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "parent_id" })
  parent?: AdministrativeDivision | null;

  @OneToMany(
    () => AdministrativeDivision,
    (division) => division.parent,
  )
  children?: AdministrativeDivision[];

  @OneToMany(
    () => Address,
    (address) => address.division,
  )
  addresses?: Address[];
}

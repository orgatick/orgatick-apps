import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AdministrativeDivision } from "./administrative-divisions.entity";
import { City } from "./cities.entity";
import { Address } from "./addresses.entity";

@Entity("countries", { schema: "address" })
export class Country {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "char", length: 2, unique: true })
  code!: string;

  @Column({ type: "char", length: 3, unique: true })
  code3!: string;

  @Column({ name: "numeric_code", type: "char", length: 3, unique: true })
  numericCode!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 150, nullable: true })
  capital?: string | null;

  @Column({ name: "currency_code", type: "char", length: 3, nullable: true })
  currencyCode?: string | null;

  @Column({ name: "currency_name", type: "varchar", length: 100, nullable: true })
  currencyName?: string | null;

  @Column({ name: "phone_code", type: "varchar", length: 30, nullable: true })
  phoneCode?: string | null;

  @Column({ name: "postal_code_regex", type: "varchar", length: 500, nullable: true })
  postalCodeRegex?: string | null;

  @Column({ name: "geoname_id", type: "bigint", unique: true, nullable: true })
  geonameId?: number | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  tld?: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToMany(
    () => AdministrativeDivision,
    (administrativeDivision) => administrativeDivision.country,
  )
  administrativeDivisions?: AdministrativeDivision[];

  @OneToMany(
    () => City,
    (city) => city.country,
  )
  cities?: City[];

  @OneToMany(
    () => Address,
    (address) => address.country,
  )
  addresses?: Address[];
}

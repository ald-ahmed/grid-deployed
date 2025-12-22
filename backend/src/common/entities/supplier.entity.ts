import { Entity, Column, OneToMany } from "typeorm";
import { ObjectType, Field, Float } from "@nestjs/graphql";
import { BaseEntity } from "./base.entity";
import { Product } from "./product.entity";

@Entity("suppliers")
@ObjectType()
export class Supplier extends BaseEntity {
  @Column()
  @Field()
  name!: string;

  @Column()
  @Field()
  country!: string;

  @Column("decimal", { precision: 3, scale: 1 })
  @Field(() => Float)
  reliabilityScore!: number;

  @OneToMany(() => Product, (product) => product.supplier)
  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { ObjectType, Field, Float } from "@nestjs/graphql";
import { BaseEntity } from "./base.entity";
import { Product } from "./product.entity";

@Entity("categories")
@ObjectType()
export class Category extends BaseEntity {
  @Column()
  @Field()
  name!: string;

  @Column("decimal", { precision: 5, scale: 4, nullable: true })
  @Field(() => Float, { nullable: true })
  taxRate?: number;

  // Self-referencing relationship
  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "parentId" })
  @Field(() => Category, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  @Field(() => [Category], { nullable: true })
  children?: Category[];

  @OneToMany(() => Product, (product) => product.category)
  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

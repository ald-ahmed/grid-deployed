import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { ObjectType, Field, Float, Int } from "@nestjs/graphql";
import { BaseEntity } from "./base.entity";
import { Tag } from "./tag.entity";
import { Category } from "./category.entity";
import { Supplier } from "./supplier.entity";

@Entity("products")
@ObjectType()
export class Product extends BaseEntity {
  @Column()
  @Field()
  name!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @Field(() => Float)
  price!: number;

  @Column("int")
  @Field(() => Int)
  quantity!: number;

  @Column("date")
  @Field(() => String)
  launchDate!: Date;

  @Column()
  @Field()
  status!: string;

  @Column("boolean", { default: true })
  @Field(() => Boolean)
  isActive!: boolean;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: "product_tags",
    joinColumn: { name: "productId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tagId", referencedColumnName: "id" },
  })
  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "categoryId" })
  @Field(() => Category, { nullable: true })
  category?: Category;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: "supplierId" })
  @Field(() => Supplier, { nullable: true })
  supplier?: Supplier;

  // Calculated fields (not database columns)
  @Field(() => Int, { nullable: true })
  distinct_tag_count?: number;

  @Field(() => Float, { nullable: true })
  total_value?: number;
}

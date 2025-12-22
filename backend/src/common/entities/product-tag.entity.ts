import { Entity, PrimaryColumn, Index } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";

@Entity("product_tags")
@Index(["productId", "tagId"], { unique: true })
@ObjectType()
export class ProductTag {
  @PrimaryColumn("uuid")
  @Field()
  productId!: string;

  @PrimaryColumn("uuid")
  @Field()
  tagId!: string;
}

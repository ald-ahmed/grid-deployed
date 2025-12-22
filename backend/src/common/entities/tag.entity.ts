import { Entity, Column } from "typeorm";
import { ObjectType, Field } from "@nestjs/graphql";
import { BaseEntity } from "./base.entity";

@Entity("tags")
@ObjectType()
export class Tag extends BaseEntity {
  @Column()
  @Field()
  name!: string;
}

import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id!: string;

  @CreateDateColumn()
  @Field()
  createdAt!: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt!: Date;
}

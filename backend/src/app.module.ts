import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriverConfig, ApolloDriver } from "@nestjs/apollo";
import { ProductsModule } from "./products/products.module";
import { Product } from "./common/entities/product.entity";
import { Tag } from "./common/entities/tag.entity";
import { ProductTag } from "./common/entities/product-tag.entity";
import { Category } from "./common/entities/category.entity";
import { Supplier } from "./common/entities/supplier.entity";
import { DATABASE_URL } from "../../shared/config";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: DATABASE_URL,
      entities: [Product, Tag, ProductTag, Category, Supplier],
      synchronize: true, // Only for development
      logging: process.env.NODE_ENV === "development",
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      csrfPrevention: false,
    }),
    ProductsModule,
  ],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "../common/entities/product.entity";
import { Tag } from "../common/entities/tag.entity";
import { ProductTag } from "../common/entities/product-tag.entity";
import { Category } from "../common/entities/category.entity";
import { Supplier } from "../common/entities/supplier.entity";
import { ProductsService } from "./products.service";
import { ProductsResolver } from "./products.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Tag, ProductTag, Category, Supplier]),
  ],
  providers: [ProductsService, ProductsResolver],
  exports: [ProductsService],
})
export class ProductsModule {}

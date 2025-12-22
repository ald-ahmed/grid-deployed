import { Resolver, Query, Args, Mutation } from "@nestjs/graphql";
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { ProductsService, ServerSideResponse } from "./products.service";
import { Product } from "../common/entities/product.entity";
import { ServerSideRequest } from "../common/dto/pagination.dto";

@ObjectType()
export class ServerSideResult {
  @Field(() => [Product])
  rowData!: Product[];

  @Field(() => Int, { nullable: true })
  rowCount?: number;

  @Field(() => [String], { nullable: true })
  pivotResultFields?: string[];
}

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => ServerSideResult)
  async getServerSideProducts(
    @Args("request") request: ServerSideRequest
  ): Promise<ServerSideResponse> {
    return this.productsService.getServerSideData(request);
  }

  @Mutation(() => String)
  async seedProducts(): Promise<string> {
    await this.productsService.seedData();
    return "Products seeded successfully";
  }
}

import {
  Field,
  ObjectType,
  Int,
  InputType,
  registerEnumType,
} from "@nestjs/graphql";
import {
  IServerSideGetRowsRequest,
  FilterModel,
  AdvancedFilterModel,
} from "ag-grid-community";
import { GraphQLJSON } from "graphql-type-json";

@InputType()
export class ColumnVO {
  @Field()
  id!: string;

  @Field()
  displayName!: string;

  @Field({ nullable: true })
  field?: string;

  @Field({ nullable: true })
  aggFunc?: string;
}

@InputType()
export class SortModelItem {
  @Field()
  colId!: string;

  @Field()
  sort!: "asc" | "desc";
}

@InputType()
export class ServerSideRequest implements IServerSideGetRowsRequest {
  @Field(() => Int, { nullable: true })
  startRow: number | undefined;

  @Field(() => Int, { nullable: true })
  endRow: number | undefined;

  @Field(() => [ColumnVO])
  rowGroupCols!: ColumnVO[];

  @Field(() => [ColumnVO])
  valueCols!: ColumnVO[];

  @Field(() => [ColumnVO])
  pivotCols!: ColumnVO[];

  @Field()
  pivotMode!: boolean;

  @Field(() => [String])
  groupKeys!: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  filterModel!: FilterModel | AdvancedFilterModel | null;

  @Field(() => [SortModelItem])
  sortModel!: SortModelItem[];
}

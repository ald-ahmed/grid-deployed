# AG Grid Server-Side Challenge

## Overview

This challenge evaluates your ability to implement efficient server-side operations for AG Grid Enterprise. You'll be working with a product catalog system containing 10,000 products with relationships to tags, categories, and suppliers.

## Quick Links

Key files referenced in this guide:

- [`frontend/src/lib/api/queries.ts`](frontend/src/lib/api/queries.ts) - GraphQL query definitions
- [`frontend/src/lib/config/grid-config.ts`](frontend/src/lib/config/grid-config.ts) - AG Grid column configurations
- [`frontend/src/components/ProductGrid.tsx`](frontend/src/components/ProductGrid.tsx) - React grid component
- [`backend/src/products/products.resolver.ts`](backend/src/products/products.resolver.ts) - GraphQL resolver
- [`backend/src/products/products.service.ts`](backend/src/products/products.service.ts) - Service implementation

## Architecture: How the Files are Linked

The application follows a clean data flow from frontend to backend:

### 1. GraphQL Query Definition (`queries.ts`)

```typescript:3:58:frontend/src/lib/api/queries.ts
export const GET_SERVER_SIDE_PRODUCTS = gql`
  query GetServerSideProducts($request: ServerSideRequest!) {
    getServerSideProducts(request: $request) {
      rowData {
        id
        name
        price
        quantity
        launchDate
        status
        isActive
        tags {
          id
          name
          createdAt
          updatedAt
        }
        supplier {
          id
          name
          country
          reliabilityScore
          createdAt
          updatedAt
        }
        category {
          id
          name
          taxRate
          createdAt
          updatedAt
          parent {
            id
            name
            taxRate
            createdAt
            updatedAt
            parent {
              id
              name
              taxRate
              createdAt
              updatedAt
            }
          }
        }
        distinct_tag_count
        total_value
        createdAt
        updatedAt
      }
      rowCount
      pivotResultFields
    }
  }
`;
```

This query defines the GraphQL request structure sent to the backend.

### 2. Frontend Configuration (`grid-config.ts`)

```typescript:72:111:frontend/src/lib/config/grid-config.ts
export const COLUMN_DEFINITIONS: ColDef[] = [
  {
    field: "category.parent.parent.name",
    headerName: "Category Grandparent",
    sortable: true,
    filter: true,
    enableRowGroup: true,
  },
  {
    field: "supplier.country",
    headerName: "Supplier Country",
    sortable: true,
    filter: true,
    enableRowGroup: true,
  },
  {
    field: "tags.name",
    headerName: "Tag Names",
    sortable: true,
    filter: true,
    valueGetter: (params) =>
      params.data?.tags?.map((tag: Tag) => tag.name).join(", ") || "None",
  },
  {
    field: "total_value",
    headerName: "Total Value",
    aggFunc: "sum",
    sortable: true,
    filter: "agNumberColumnFilter",
    valueFormatter: (params: ValueFormatterParams<Product>) =>
      `$${params.value?.toFixed(2) || "0.00"}`,
  },
  {
    field: "distinct_tag_count",
    headerName: "Distinct Tags",
    sortable: true,
    filter: "agNumberColumnFilter",
    aggFunc: "sum",
  },
];
```

This file defines the column configurations for AG Grid, including:

- Nested relationship fields like `category.parent.parent.name` and `supplier.country`
- Computed fields like `total_value` (price \* quantity) and `distinct_tag_count`
- Aggregation functions for grouping (not important)
- Filter types and sorting capabilities (also not important)

**Important:** The `field` property in each column definition directly maps to the JSON structure returned from `queries.ts`. For example:

- `field: "category.parent.parent.name"` maps to the nested structure `category { parent { parent { name } } }` in the GraphQL query
- `field: "supplier.country"` maps to `supplier { country }`
- `field: "tags.name"` maps to `tags { name }`
- `field: "total_value"` maps to the computed field `total_value` returned in the query response

**Advanced Column Features:**

- **`valueGetter`**: Receives the entire row data via `params.data` and can compute custom values. For example, the "Tag Names" column uses `valueGetter` to access `params.data.tags` and join tag names. Note: when using `valueGetter`, the `field` property is optional since you have access to the full row data.
- **`valueFormatter`**: Formats already-computed values for display purposes. For example, the "Total Value" column uses `valueFormatter` to add dollar sign and decimal formatting to the numeric `total_value` field.
- **`aggFunc`**: Defines the aggregation function for grouped rows. Type signature: `aggFunc?: string | IAggFunc<TData, TValue> | null`. Can be any string like `"sum"`, `"avg"`, `"min"`, `"max"`, `"count"`, or, again, any string. Columns that have aggFunc defined will be automatically put in the value cols in the request (`params` passed into `getRows` in `serverSideDatasource`).

### 3. React Grid Component (`ProductGrid.tsx`)

This component renders the AG Grid Enterprise table with server-side row model capabilities. The grid is configured with `rowModelType="serverSide"` and receives a `serverSideDatasource` object that implements the `IServerSideDatasource` interface.

```typescript:114:130:frontend/src/components/ProductGrid.tsx
<AgGridReact
  ref={gridRef}
  columnDefs={COLUMN_DEFINITIONS}
  defaultColDef={DEFAULT_COL_DEF}
  rowModelType="serverSide"
   .
   .
   .
  serverSideDatasource={serverSideDatasource}
/>
```

The `serverSideDatasource` defines how the grid fetches data on-demand:

```typescript:83:94:frontend/src/components/ProductGrid.tsx
const { data } = await apolloClient.query({
  query: GET_SERVER_SIDE_PRODUCTS,
  variables: { request: serverSideRequest },
  fetchPolicy: "no-cache",
});

const result = data.getServerSideProducts;

params.success({
  rowData: result.rowData,
  rowCount: result.rowCount,
});
```

The component:

- Creates AG Grid with `rowModelType="serverSide"` for lazy loading
- Passes a `serverSideDatasource` object to handle data fetching
- Implements `IServerSideDatasource.getRows()` which is called automatically by AG Grid
- Sends GraphQL queries when user scrolls, filters, sorts, or groups
- Returns results via `params.success()` with rowData and rowCount

### 4. GraphQL Resolver (`products.resolver.ts`)

```typescript:23:28:backend/src/products/products.resolver.ts
@Query(() => ServerSideResult)
async getServerSideProducts(
  @Args("request") request: ServerSideRequest
): Promise<ServerSideResponse> {
  return this.productsService.getServerSideData(request);
}
```

The resolver:

- Receives the AG Grid server-side request
- Delegates to the service layer for business logic

### 5. Service Implementation (`products.service.ts`)

```typescript:62:126:backend/src/products/products.service.ts
async getServerSideData(
  request: ServerSideRequest
): Promise<ServerSideResponse> {
  console.warn(
    "WARNING: Loading ALL products into memory - this is inefficient!"
  );

  // INEFFICIENT: Loading ALL products with all relationships
  const allProducts = await this.productRepository.find({
    relations: [
      "tags",
      "supplier",
      "category",
      "category.parent",
      "category.parent.parent",
    ],
    order: {
      id: "ASC", // Default ordering
    },
  });

  // Add calculated fields to each product (inefficient!)
  const productsWithCalculatedFields: FrontendProduct[] = allProducts.map(
    (product) => ({
      ...product,
      distinct_tag_count: product.tags ? product.tags.length : 0,
      total_value: product.price * product.quantity,
    })
  );

  // Process filtering in JavaScript (BAD!)
  let filteredProducts = [...productsWithCalculatedFields];

  // Apply filters if present
  if (request.filterModel) {
    filteredProducts = this.applyFiltersInMemory(
      filteredProducts,
      request.filterModel
    );
  }

  // Apply sorting in JavaScript (BAD!)
  if (request.sortModel && request.sortModel.length > 0) {
    filteredProducts = this.applySortingInMemory(
      filteredProducts,
      request.sortModel
    );
  }

  // Apply grouping in JavaScript (if needed)
  if (request.rowGroupCols && request.rowGroupCols.length > 0) {
    // TODO: Implement grouping (this is complex and should be done in the database!)
    console.warn("Grouping not implemented in this inefficient version");
  }

  // Paginate in JavaScript (BAD!)
  const startRow = request.startRow || 0;
  const endRow = request.endRow || 100;
  const paginatedProducts = filteredProducts.slice(startRow, endRow);

  return {
    rowData: paginatedProducts,
    rowCount: filteredProducts.length, // Total count after filtering
  };
}
```

The current implementation:

- Loads all 10,000 products into memory
- Filters, sorts, and paginates in JavaScript

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js + React)                                     │
├─────────────────────────────────────────────────────────────────┤
│  1. grid-config.ts        → Product types & column definitions  │
│  2. ProductGrid.tsx       → AG Grid component with datasource   │
│  3. queries.ts            → GraphQL query definition            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ GraphQL over HTTP
┌─────────────────────────────┴───────────────────────────────────┐
│  Backend (NestJS + TypeORM)                                     │
├─────────────────────────────────────────────────────────────────┤
│  4. products.resolver.ts  → GraphQL resolver                    │
│  5. products.service.ts   → Business logic (YOUR TASK HERE)     │
└─────────────────────────────────────────────────────────────────┘
```

When a user scrolls, filters, or sorts the grid:

1. AG Grid triggers `getRows()` in `ProductGrid.tsx`
2. Component sends GraphQL query via `queries.ts`
3. Backend resolver receives request in `products.resolver.ts`
4. Service processes request in `products.service.ts`
5. Response flows back through the same chain

## Quick Start

To start the app, open in VS Code and run the task specified in `.vscode/tasks.json`.  
(From the command palette: "Tasks: Run Task" → "Start All")

### URLs

- Frontend: http://localhost:3000
- Backend GraphQL: http://localhost:4000/graphql

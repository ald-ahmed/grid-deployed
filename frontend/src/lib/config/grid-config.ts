import { ColDef, ValueFormatterParams } from "ag-grid-enterprise";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  launchDate: string;
  status: string;
  isActive: boolean;
  tags?: Tag[];
  category?: Category;
  supplier?: Supplier;
  distinct_tag_count?: number;
  total_value?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  taxRate?: number;
  parent?: Category;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  reliabilityScore: number;
}

// ============================================================================
// GRID CONSTANTS
// ============================================================================

export const GRID_CONSTANTS = {
  // Pagination
  PAGINATION_PAGE_SIZE: 100,

  // Server-side specific
  CACHE_BLOCK_SIZE: 1000,
  MAX_BLOCKS_IN_CACHE: 5,
  BLOCK_LOAD_DEBOUNCE_MS: 100,

  // Client-side specific
  BATCH_SIZE: 10000,

  // Layout
  GRID_HEIGHT: "80vh",
  CONTAINER_WIDTHS: {
    GRID: "70%",
    DEBUG: "30%",
    FULL: "100%",
  },
} as const;

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

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

export const DEFAULT_COL_DEF = {
  resizable: true,
  sortable: true,
  filter: true,
} as const;

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

export const STYLES = {
  CONTAINER: "w-full flex gap-6",
  GRID_WRAPPER: (hasDebug: boolean) =>
    `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/15 transition-all duration-500 group overflow-hidden ${
      hasDebug ? `flex-[7]` : `flex-1`
    }`,
  GRID_INNER: "relative m-4",
  GRID_THEME:
    "ag-theme-custom w-full h-[80vh] border border-white/10 rounded-xl overflow-hidden shadow-inner",
  DEBUG_WRAPPER: `flex-[3] backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-6 shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/15 transition-all duration-500 group overflow-hidden`,
  DEBUG_HEADER: "mb-3",
  DEBUG_TITLE: "text-lg font-semibold text-white/90 flex items-center gap-2",
  DEBUG_ICON: "text-blue-400",
  DEBUG_SUBTITLE: "text-sm text-white/70",
  DEBUG_CONTENT: "relative space-y-4",
  DEBUG_SECTION: "mb-2",
  DEBUG_SECTION_TITLE: "text-sm font-medium text-white/80 mb-2",
  DEBUG_PRE:
    "text-xs text-white/80 bg-black/50 rounded-xl p-3 overflow-auto border border-white/5 max-h-[30vh] font-mono leading-relaxed",
  DEBUG_PRE_STATE:
    "text-xs text-white/80 bg-black/50 rounded-xl p-3 overflow-auto border border-white/5 max-h-[35vh] font-mono leading-relaxed",
  DEBUG_BADGE:
    "px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300 border border-blue-400/20",
  DEBUG_BADGE_POSITION: "absolute top-2 right-2",
} as const;

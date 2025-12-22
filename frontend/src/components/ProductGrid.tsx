"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from "ag-grid-enterprise";

import { apolloClient } from "../lib/api/apollo";
import { GET_SERVER_SIDE_PRODUCTS } from "../lib/api/queries";
import { IServerSideGetRowsRequest } from "ag-grid-community";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";
import { gridTheme } from "./ui/utils";
import {
  Product,
  GRID_CONSTANTS,
  COLUMN_DEFINITIONS,
  DEFAULT_COL_DEF,
  STYLES,
} from "../lib/config/grid-config";

ModuleRegistry.registerModules([AllEnterpriseModule]);

interface ProductGridProps {
  isLoadingCallback?: (loading: boolean) => void;
}

export interface ProductGridRef {
  api: () => any;
}

const ProductGrid = forwardRef<ProductGridRef, ProductGridProps>(
  ({ isLoadingCallback } = {}, ref) => {
    const gridRef = useRef<AgGridReact>(null);

    useImperativeHandle(ref, () => ({
      api: () => gridRef.current?.api,
    }));

    const [isLoading, setIsLoading] = useState(false);
    const [lastRequest, setLastRequest] =
      useState<IServerSideGetRowsRequest | null>(null);
    const [gridState, setGridState] = useState<any>(null);

    useEffect(() => {
      isLoadingCallback?.(isLoading);
    }, [isLoadingCallback, isLoading]);

    const serverSideDatasource: IServerSideDatasource<Product> = useMemo(
      () => ({
        getRows: async (params: IServerSideGetRowsParams<Product>) => {
          setIsLoading(true);
          try {
            setLastRequest(params.request);

            if (gridRef.current?.api) {
              const state = gridRef.current.api.getState();
              setGridState(state);
            }

            const serverSideRequest: IServerSideGetRowsRequest = {
              startRow: params.request.startRow,
              endRow: params.request.endRow,
              rowGroupCols: params.request.rowGroupCols,
              valueCols: params.request.valueCols,
              pivotCols: params.request.pivotCols,
              pivotMode: params.request.pivotMode,
              groupKeys: params.request.groupKeys,
              sortModel: params.request.sortModel,
              filterModel: params.request.filterModel,
            };

            console.log("serverSideRequest", serverSideRequest);

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
          } catch (error) {
            console.error("Error fetching data:", error);
            params.fail();
          } finally {
            setIsLoading(false);
          }
        },
      }),
      []
    );

    const hasDebugData = Boolean(lastRequest || gridState);

    return (
      <div className={STYLES.CONTAINER}>
        {/* Grid Container */}
        <div className={STYLES.GRID_WRAPPER(hasDebugData)}>
          <div className={STYLES.GRID_INNER}>
            <div className={STYLES.GRID_THEME}>
              <AgGridReact
                ref={gridRef}
                columnDefs={COLUMN_DEFINITIONS}
                defaultColDef={DEFAULT_COL_DEF}
                rowModelType="serverSide"
                animateRows={true}
                cellSelection={true}
                rowGroupPanelShow="always"
                sideBar={false}
                pagination={true}
                paginationPageSize={GRID_CONSTANTS.PAGINATION_PAGE_SIZE}
                cacheBlockSize={GRID_CONSTANTS.CACHE_BLOCK_SIZE}
                maxBlocksInCache={GRID_CONSTANTS.MAX_BLOCKS_IN_CACHE}
                blockLoadDebounceMillis={GRID_CONSTANTS.BLOCK_LOAD_DEBOUNCE_MS}
                theme={gridTheme}
                serverSideDatasource={serverSideDatasource}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;

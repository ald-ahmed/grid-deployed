import { gql } from "@apollo/client";

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

export const SEED_PRODUCTS = gql`
  mutation SeedProducts {
    seedProducts
  }
`;

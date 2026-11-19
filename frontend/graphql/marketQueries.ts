import { gql } from "@apollo/client";

export const GET_MAP_MARKETS = gql`
    query GetMapMarkets {
        markets {
            id
            name
            description
            imageUrl
            address
            latitude
            longitude
            openingHours
            categories
            iconKey
            sellers {
                id
                full_name
                description
                avatar
            }
        }
    }
`
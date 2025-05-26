# BigBox API Documentation

## Getting Started

BigBox API is an API to retrieve public-domain data from Home Depot in real-time. You can use BigBox API to retrieve products, reviews, questions, search results, and category listings from Home Depot.

BigBox API returns clean, structured JSON or CSV results. You can achieve fine-grained control over your request using the request parameters.

## Response Times & Concurrency

BigBox API gathers data in real-time and will typically return a result in 1-6 seconds. Please inspect the HTTP Response Code and update your app accordingly.

If you need to run large volumes of requests, consider using the Collections API. Collections allow you to enqueue up to 15,000 requests, run them manually or on a schedule, and execute them concurrently on BigBox API's infrastructure.

## Retrieving Search Results for Products on Home Depot

### GET /request

Getting search result Home Depot data with BigBox API is as simple as making an HTTP GET request to the `/request` endpoint. The only required parameters are `api_key` (sign up for free to get an API key) and `type` (which defines the type of Home Depot data you'd like to retrieve).

For example, to retrieve search results (`type=search`) for the search term `lawn mower`, ordered by best-selling products (`sort_by=best_seller`) the BigBox API request would be:

```python
import requests
import json

# set up the request parameters
params = {
  'api_key': 'demo',
  'type': 'search',
  'search_term': 'lawn mower',
  'sort_by': 'best_seller'
}

# make the http GET request to BigBox API
api_result = requests.get('https://api.bigboxapi.com/request', params=params)

# print the JSON response from BigBox API
print(json.dumps(api_result.json()))
```

The search results are shown below within the `search_results` array. For full documentation on the search results response see the [Search Results docs](link-to-search-results-docs).

```json
{
  "request_info": {
    "success": true,
    "credits_used": 1,
    "credits_remaining": 999
  },
  "request_metadata": {
    "created_at": "2020-01-01T00:00:00.000Z",
    "processed_at": "2020-01-01T00:00:00.000Z",
    "total_time_taken": 2.15,
    "homedepot_url": "https://www.homedepot.com/s/lawn+mower?NCNI-5"
  },
  "request_parameters": {
    "type": "search",
    "search_term": "lawn mower",
    "sort_by": "best_seller"
  },
  "search_results": [
    {
      "position": 1,
      "product": {
        "title": "Honda 21 in. 3-in-1 Variable Speed Gas Walk Behind Self Propelled Lawn Mower with Auto Choke",
        "link": "https://www.homedepot.com/p/Honda-21-in-3-in-1-Variable-Speed-Gas-Walk-Behind-Self-Propelled-Lawn-Mower-with-Auto-Choke-HRN216VKA/314013158",
        "is_bestseller": true,
        "brand": "Honda",
        "favorite_count": 1053,
        "item_id": "314013158",
        "store_sku": "1004556576",
        "model_number": "HRN216VKA",
        "images": [
          "https://images.thdstatic.com/productImages/b805cb94-f0f9-4800-bf93-2070a92a8704/svn/honda-self-propelled-lawn-mowers-hrn216vka-64_1000.jpg",
          "https://images.thdstatic.com/productImages/2da3aa20-c521-4191-8855-32c65af1ec4e/svn/honda-self-propelled-lawn-mowers-hrn216vka-e4_1000.jpg"
        ],
        "primary_image": "https://images.thdstatic.com/productImages/b805cb94-f0f9-4800-bf93-2070a92a8704/svn/honda-self-propelled-lawn-mowers-hrn216vka-64_1000.jpg",
        "rating": 4.5,
        "ratings_total": 5192,
        "collection": {
          "id": "Family-312406020",
          "name": "Family-312406020",
          "link": "https://www.homedepot.com/collection/Outdoors/Honda-Lawn-Mowers-Collection/Family-312406020?omsid=314013158"
        },
        "features": [
          {
            "name": "Power Type",
            "value": "Gas"
          },
          {
            "name": "Cutting Width (in.)",
            "value": "21 inches"
          },
          {
            "name": "Size of Yard",
            "value": "1/4 - 1/2 Acre"
          },
          {
            "name": "Engine Make",
            "value": "Honda Engine"
          },
          {
            "name": "Features",
            "value": "Mulching Lawn Mower"
          }
        ]
      },
      "fulfillment": {
        "pickup": false,
        "ship_to_store": true,
        "ship_to_home": true,
        "scheduled_delivery": false,
        "ship_to_store_info": {
          "store_id": "6242",
          "store_state": "Stamford",
          "store_name": "CT",
          "stock_level": 2427,
          "in_stock": true
        },
        "ship_to_home_info": {
          "in_stock": true,
          "stock_level": 9999
        }
      },
      "offers": {
        "primary": {
          "price": 469,
          "regular_price": 549,
          "symbol": "$",
          "currency": "USD"
        }
      }
    },
    {
      "position": 2,
      "product": {
        "title": "RYOBI 40V HP Brushless 20 in. Cordless Battery Walk Behind Push Mower with 6.0 Ah Battery and Charger",
        "link": "https://www.homedepot.com/p/RYOBI-40V-HP-Brushless-20-in-Cordless-Battery-Walk-Behind-Push-Mower-with-6-0-Ah-Battery-and-Charger-RY401170VNM/317061059",
        "is_bestseller": true,
        "brand": "RYOBI",
        "item_id": "317061059",
        "store_sku": "1006431841",
        "model_number": "RY401170VNM",
        "images": [
          "https://images.thdstatic.com/productImages/63e8deea-ed6d-442d-8d0c-5a061c301bff/svn/ryobi-push-lawn-mowers-ry401170vnm-64_1000.jpg",
          "https://images.thdstatic.com/productImages/06034308-37ee-4a31-bcc2-94862828c43d/svn/ryobi-push-lawn-mowers-ry401170vnm-e4_1000.jpg"
        ],
        "primary_image": "https://images.thdstatic.com/productImages/63e8deea-ed6d-442d-8d0c-5a061c301bff/svn/ryobi-push-lawn-mowers-ry401170vnm-64_1000.jpg",
        "rating": 4.7,
        "ratings_total": 835,
        "features": [
          {
            "name": "Power Type",
            "value": "Battery"
          },
          {
            "name": "Cutting Width (in.)",
            "value": "20 inches"
          },
          {
            "name": "Voltage (v)",
            "value": "40v"
          },
          {
            "name": "Size of Yard",
            "value": "1/4 - 1/2 Acre"
          },
          {
            "name": "Battery Run Time (min.)",
            "value": "48"
          }
        ]
      },
      "fulfillment": {
        "pickup": true,
        "ship_to_store": false,
        "ship_to_home": true,
        "scheduled_delivery": false,
        "pickup_info": {
          "store_id": "6242",
          "store_state": "Stamford",
          "store_name": "CT",
          "stock_level": 9,
          "in_stock": true
        },
        "ship_to_home_info": {
          "in_stock": true,
          "stock_level": 9999
        }
      },
      "offers": {
        "primary": {
          "price": 299,
          "symbol": "$",
          "currency": "USD"
        }
      }
    },
    {
      "position": 3,
      "product": {
        "title": "RYOBI 40V HP Brushless 21 in. Cordless Battery Walk Behind Self-Propelled Lawn Mower with (2) 6.0 Ah Batteries and Charger",
        "link": "https://www.homedepot.com/p/RYOBI-40V-HP-Brushless-21-in-Cordless-Battery-Walk-Behind-Self-Propelled-Lawn-Mower-with-2-6-0-Ah-Batteries-and-Charger-RY401140US/314600837",
        "is_exclusive": true,
        "brand": "RYOBI",
        "item_id": "314600837",
        "store_sku": "1005788802",
        "model_number": "RY401140US",
        "images": [
          "https://images.thdstatic.com/productImages/6edf6453-7ea4-4e52-9478-b4fc3cf850e6/svn/ryobi-self-propelled-lawn-mowers-ry401140us-64_1000.jpg",
          "https://images.thdstatic.com/productImages/06034308-37ee-4a31-bcc2-94862828c43d/svn/ryobi-self-propelled-lawn-mowers-ry401140us-e4_1000.jpg"
        ],
        "primary_image": "https://images.thdstatic.com/productImages/6edf6453-7ea4-4e52-9478-b4fc3cf850e6/svn/ryobi-self-propelled-lawn-mowers-ry401140us-64_1000.jpg",
        "rating": 4.5,
        "ratings_total": 1766,
        "features": [
          {
            "name": "Cutting Width (in.)",
            "value": "21 inches"
          },
          {
            "name": "Power Type",
            "value": "Battery"
          },
          {
            "name": "Size of Yard",
            "value": "1/2 - 1 Acre"
          },
          {
            "name": "Features",
            "value": "Mulching Lawn Mower"
          },
          {
            "name": "Rear Wheel Height (in.)",
            "value": "High Wheel"
          }
        ]
      },
      "fulfillment": {
        "pickup": false,
        "ship_to_store": true,
        "ship_to_home": true,
        "scheduled_delivery": false,
        "ship_to_store_info": {
          "store_id": "6242",
          "store_state": "Stamford",
          "store_name": "CT",
          "stock_level": 408,
          "in_stock": true
        },
        "ship_to_home_info": {
          "in_stock": true,
          "stock_level": 9999
        }
      },
      "offers": {
        "primary": {
          "price": 499,
          "regular_price": 549,
          "symbol": "$",
          "currency": "USD"
        }
      }
    },
    {
      "position": 4,
      "product": {
        "title": "Toro Flex-Force 22 in. 60-Volt Cordless 2-Tool Combo Kit Recycler Mower & 14 in./16 in. String Trimmer - Charger/2 Batteries",
        "link": "https://www.homedepot.com/p/Toro-Flex-Force-22-in-60-Volt-Cordless-2-Tool-Combo-Kit-Recycler-Mower-14-in-16-in-String-Trimmer-Charger-2-Batteries-66351/320792383",
        "sponsored": true,
        "brand": "Toro",
        "item_id": "320792383",
        "model_number": "66351",
        "images": [
          "https://images.thdstatic.com/productImages/a3dd1331-9abd-4908-bde8-d24048693089/svn/toro-self-propelled-lawn-mowers-66351-64_1000.jpg",
          "https://images.thdstatic.com/productImages/ea72f0b1-c2dd-4595-b90d-a3bc764953e9/svn/toro-self-propelled-lawn-mowers-66351-e4_1000.jpg"
        ],
        "primary_image": "https://images.thdstatic.com/productImages/a3dd1331-9abd-4908-bde8-d24048693089/svn/toro-self-propelled-lawn-mowers-66351-64_1000.jpg",
        "rating": 0,
        "ratings_total": 0,
        "features": [
          {
            "name": "Cutting Width (in.)",
            "value": "22 inches"
          },
          {
            "name": "Power Type",
            "value": "Battery"
          },
          {
            "name": "Size of Yard",
            "value": "1/4 - 1/2 Acre"
          },
          {
            "name": "Rear Wheel Height (in.)",
            "value": "High Wheel"
          },
          {
            "name": "Drive Type",
            "value": "Rear-wheel Drive"
          }
        ]
      },
      "fulfillment": {
        "pickup": false,
        "ship_to_store": true,
        "ship_to_home": true,
        "scheduled_delivery": false,
        "ship_to_store_info": {
          "store_id": "6242",
          "store_state": "Stamford",
          "store_name": "CT",
          "stock_level": 158,
          "in_stock": true
        },
        "ship_to_home_info": {
          "in_stock": true,
          "stock_level": 9999
        }
      },
      "offers": {
        "primary": {
          "price": 798.99,
          "symbol": "$",
          "currency": "USD"
        }
      }
    },
    {
      "position": 5,
      "product": {
        "title": "RYOBI 40V HP Brushless 21 in. Cordless Battery Walk Behind Dual-Blade Self-Propelled Mower with (2) 6.0 Ah Batteries & Charger",
        "link": "https://www.homedepot.com/p/RYOBI-40V-HP-Brushless-21-in-Cordless-Battery-Walk-Behind-Dual-Blade-Self-Propelled-Mower-with-2-6-0-Ah-Batteries-Charger-RY401150US/314428494",
        "is_top_rated": true,
        "is_exclusive": true,
        "brand": "RYOBI",
        "item_id": "314428494",
        "store_sku": "1005788757",
        "model_number": "RY401150US",
        "images": [
          "https://images.thdstatic.com/productImages/ede5f12d-4e02-4de1-8719-c77d0b32f0a8/svn/ryobi-self-propelled-lawn-mowers-ry401150us-64_1000.jpg",
          "https://images.thdstatic.com/productImages/06034308-37ee-4a31-bcc2-94862828c43d/svn/ryobi-self-propelled-lawn-mowers-ry401150us-e4_1000.jpg"
        ],
        "primary_image": "https://images.thdstatic.com/productImages/ede5f12d-4e02-4de1-8719-c77d0b32f0a8/svn/ryobi-self-propelled-lawn-mowers-ry401150us-64_1000.jpg",
        "rating": 4.4,
        "ratings_total": 1078,
        "features": [
          {
            "name": "Cutting Width (in.)",
            "value": "21 inches"
          },
          {
            "name": "Power Type",
            "value": "Battery"
          },
          {
            "name": "Size of Yard",
            "value": "1/2 - 1 Acre"
          },
          {
            "name": "Features",
            "value": "Mulching Lawn Mower"
          },
          {
            "name": "Rear Wheel Height (in.)",
            "value": "High Wheel"
          }
        ]
      },
      "fulfillment": {
        "pickup": true,
        "ship_to_store": false,
        "scheduled_delivery": true,
        "pickup_info": {
          "store_id": "6242",
          "store_state": "Stamford",
          "store_name": "CT",
          "stock_level": 4,
          "in_stock": true
        },
        "scheduled_delivery_info": {
          "in_stock": false,
          "stock_level": 11
        }
      },
      "offers": {
        "primary": {
          "price": 599,
          "symbol": "$",
          "currency": "USD"
        }
      }
    }
  ],
  "breadcrumbs": [
    {
      "name": "Outdoors",
      "link": "https://www.homedepot.com/b/Outdoors/N-5yc1vZbx82"
    },
    {
      "name": "Outdoor Power Equipment",
      "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment/N-5yc1vZbx5c"
    },
    {
      "name": "Lawn Mowers",
      "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/N-5yc1vZc5ar"
    }
  ],
  "related_queries": [
    {
      "query": "dewalt cordless screwdriver"
    },
    {
      "query": "dewalt screwdriver"
    },
    {
      "query": "cordless screwdriver"
    },
    {
      "query": "milwaukee electric screwdriver"
    },
    {
      "query": "dewalt gyroscopic screwdriver"
    },
    {
      "query": "cordless electric screwdriver"
    },
    {
      "query": "dewalt drill"
    },
    {
      "query": "electric screwdriver"
    }
  ],
  "facets": [
    {
      "name": "Availability",
      "display_name": "Availability",
      "values": [
        {
          "display_name": "Show Unavailable Products",
          "value": "bwo5s",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/Show-Unavailable-Products/N-5yc1vZc5arZbwo5s?NCNI-5",
          "count": 0,
          "active": false
        }
      ]
    },
    {
      "name": "Category",
      "display_name": "Category",
      "values": [
        {
          "display_name": "Lawn Mower Parts",
          "value": "2fkp8zm",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers-Lawn-Mower-Parts/N-5yc1vZ2fkp8zm",
          "count": 341,
          "active": false
        },
        {
          "display_name": "Self Propelled Lawn Mowers",
          "value": "c5ap",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers-Self-Propelled-Lawn-Mowers/N-5yc1vZc5ap",
          "count": 114,
          "active": false
        },
        {
          "display_name": "Push Lawn Mowers",
          "value": "c5ah",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers-Push-Lawn-Mowers/N-5yc1vZc5ah",
          "count": 72,
          "active": false
        },
        {
          "display_name": "Reel Lawn Mowers",
          "value": "c5av",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers-Reel-Lawn-Mowers/N-5yc1vZc5av",
          "count": 20,
          "active": false
        },
        {
          "display_name": "Field Mowers",
          "value": "c5aq",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers-Field-Mowers/N-5yc1vZc5aq",
          "count": 7,
          "active": false
        },
        {
          "display_name": "Commercial Lawn Mowers",
          "value": "c7gx",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers-Commercial-Lawn-Mowers/N-5yc1vZc7gx",
          "count": 6,
          "active": false
        },
        {
          "display_name": "Robotic Lawn Mowers",
          "value": "c5at",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers-Robotic-Lawn-Mowers/N-5yc1vZc5at",
          "count": 6,
          "active": false
        }
      ]
    },
    {
      "name": "Battery Run Time (min.)",
      "display_name": "Battery Run Time (min.)",
      "values": [
        {
          "display_name": "60",
          "value": "1z183mn",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/60/N-5yc1vZc5arZ1z183mn",
          "count": 30,
          "active": false
        },
        {
          "display_name": "0",
          "value": "1z183nb",
          "display_name": "0",
          "value": "1z183nb",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/0/N-5yc1vZc5arZ1z183nb",
          "count": 18,
          "active": false
        },
        {
          "display_name": "40",
          "value": "1z183lz",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/40/N-5yc1vZc5arZ1z183lz",
          "count": 14,
          "active": false
        },
        {
          "display_name": "70",
          "value": "1z183mv",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/70/N-5yc1vZc5arZ1z183mv",
          "count": 14,
          "active": false
        },
        {
          "display_name": "45",
          "value": "1z183m1",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/45/N-5yc1vZc5arZ1z183m1",
          "count": 8,
          "active": false
        },
        {
          "display_name": "0.0",
          "value": "1z1czwc",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/00/N-5yc1vZc5arZ1z1czwc",
          "count": 7,
          "active": false
        },
        {
          "display_name": "43",
          "value": "1z1p8ko",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/43/N-5yc1vZc5arZ1z1p8ko",
          "count": 7,
          "active": false
        },
        {
          "display_name": "30",
          "value": "1z183ln",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/30/N-5yc1vZc5arZ1z183ln",
          "count": 6,
          "active": false
        },
        {
          "display_name": "50",
          "value": "1z183mc",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/50/N-5yc1vZc5arZ1z183mc",
          "count": 6,
          "active": false
        },
        {
          "display_name": "1",
          "value": "1z1rutf",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/1/N-5yc1vZc5arZ1z1rutf",
          "count": 3,
          "active": false
        },
        {
          "display_name": "240",
          "value": "1z183ne",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/240/N-5yc1vZc5arZ1z183ne",
          "count": 3,
          "active": false
        },
        {
          "display_name": "25",
          "value": "1z183lf",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/25/N-5yc1vZc5arZ1z183lf",
          "count": 3,
          "active": false
        },
        {
          "display_name": "120",
          "value": "1z183oy",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/120/N-5yc1vZc5arZ1z183oy",
          "count": 2,
          "active": false
        },
        {
          "display_name": "20",
          "value": "1z183lb",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/20/N-5yc1vZc5arZ1z183lb",
          "count": 2,
          "active": false
        },
        {
          "display_name": "48",
          "value": "1z1b6d4",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/48/N-5yc1vZc5arZ1z1b6d4",
          "count": 2,
          "active": false
        },
        {
          "display_name": "90",
          "value": "1z183nn",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/90/N-5yc1vZc5arZ1z183nn",
          "count": 2,
          "active": false
        },
        {
          "display_name": "0.00",
          "value": "1z1narh",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/000/N-5yc1vZc5arZ1z1narh",
          "count": 1,
          "active": false
        },
        {
          "display_name": "180",
          "value": "1z183kp",
          "link": "https://www.homedepot.com/b/Outdoors-Outdoor-Power-Equipment-Lawn-Mowers/180/N-5yc1vZc5arZ1z183kp",
          "count": 1,
          "active": false
        },
        {
          "display_name": "42",
          "value": "1z1a9wt

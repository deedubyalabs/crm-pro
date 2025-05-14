import httpx
import json
import os
from textwrap import dedent
from typing import List, Optional, Dict, Any

from agno.tools import Toolkit
from agno.utils.log import logger

# --- Configuration ---
BIGBOX_API_ENDPOINT = "https://api.bigboxapi.com/request"
BIGBOX_API_KEY = "7181E3803F52488481F49B447E23B49F"

class BigBoxHomeDepotTools(Toolkit):
    """
    Toolkit for interacting with the BigBox API to retrieve Home Depot product data.
    Provides tools for searching products based on keywords and location.
    """

    def __init__(self):
        super().__init__(name="bigbox_homedepot_tools")
        self.register(self.search_homedepot_products)

        if not BIGBOX_API_KEY or BIGBOX_API_KEY == "YOUR_BIGBOX_API_KEY":
             logger.warning("BigBox API Key is not configured. Please set the BIGBOX_API_KEY environment variable.")
             # Tool will likely fail without a key, but let agent try and report error.

    def _execute_bigbox_request(self, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Helper function to execute a GET request against the BigBox API."""
        if not BIGBOX_API_KEY or BIGBOX_API_KEY == "YOUR_BIGBOX_API_KEY":
            return {"error": "BigBox API Key is not configured."}

        # Ensure the API key is included in the parameters
        params['api_key'] = BIGBOX_API_KEY

        try:
            with httpx.Client() as client:
                response = client.get(BIGBOX_API_ENDPOINT, params=params, timeout=30.0)
                response.raise_for_status() # Raise HTTPStatusError for 4xx/5xx responses
                return response.json()
        except httpx.RequestError as exc:
            logger.error(f"HTTP Request Error calling BigBox API: {exc}")
            return {"error": f"An error occurred while requesting {exc.request.url!r}: {exc}"}
        except httpx.HTTPStatusError as exc:
            logger.error(f"HTTP Status Error calling BigBox API: {exc.response.status_code} - {exc.response.text}")
            return {"error": f"Error response {exc.response.status_code} while requesting {exc.request.url!r}: {exc.response.text}"}
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON response from BigBox API: {response.text}")
            return {"error": "Failed to decode JSON response from API."}
        except Exception as e:
            logger.error(f"An unexpected error occurred calling BigBox API: {e}")
            return {"error": f"An unexpected error occurred: {e}"}

    def search_homedepot_products(
        self,
        search_term: str,
        customer_zipcode: Optional[str] = None,
        sort_by: str = "best_seller",
        limit: int = 5 # Keep the default low to manage credits/response size initially
    ) -> str:
        """
        Searches Home Depot via the BigBox API for products based on a search term.
        Optionally filters by customer zipcode for localized results and sorts results.

        Args:
            search_term (str): The product or term to search for (e.g., '2x4 lumber', 'sheetrock 4x8').
            customer_zipcode (Optional[str]): The customer's zipcode for localized pricing and availability (e.g., '68123').
            sort_by (str): Sorting order for results. Options: 'best_seller', 'most_popular', 'price_high_to_low', 'price_low_to_high', 'highest_rating'. Defaults to 'best_seller'.
            limit (int): The approximate number of results desired. API pagination works differently, but this helps guide the request. Defaults to 5.

        Returns:
            str: A JSON string containing the search results (list of products with title, price, currency) or an error message. Price is typically in dollars. Unit of measure might need to be inferred from the title.
        """
        logger.info(f"Searching BigBox Home Depot for '{search_term}'" + (f" in zipcode {customer_zipcode}" if customer_zipcode else ""))

        params = {
            "type": "search",
            "search_term": search_term,
            "sort_by": sort_by,
            # Note: BigBox uses 'page'/'max_page', not a direct limit.
            # We'll request page 1 by default. Agent might need to learn to paginate later if needed.
            "page": 1
        }
        if customer_zipcode:
            params["customer_zipcode"] = customer_zipcode

        result = self._execute_bigbox_request(params)

        # Process and simplify the result for the agent
        if result and "error" in result:
            return json.dumps(result) # Return error directly
        elif result and "search_results" in result:
            # Extract key info: title, price, currency, maybe item_id/link for future product lookups
            simplified_results = []
            for item in result["search_results"][:limit]: # Apply limit post-fetch for simplicity
                product_info = item.get("product", {})
                offer_info = item.get("offers", {}).get("primary", {})
                simplified_results.append({
                    "title": product_info.get("title"),
                    "price": offer_info.get("price"),
                    "currency": offer_info.get("currency"),
                    "item_id": product_info.get("item_id"),
                    "link": product_info.get("link"),
                    "brand": product_info.get("brand"),
                    # Add other potentially useful fields here if needed
                })
            return json.dumps(simplified_results, indent=2)
        else:
            logger.warning(f"Received unexpected response or no search_results from BigBox API: {result}")
            return json.dumps({"error": "No search results returned or unexpected response format from BigBox API."})

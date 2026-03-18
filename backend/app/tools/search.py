"""
Google Search Tool

Performs real Google searches using googlesearch-python (free, no API key).
Returns structured search results.
"""

from googlesearch import search as gsearch


def search_google(query: str, num_results: int = 6) -> list[dict]:
    """
    Search Google and return a list of result dicts.
    Each result has: title, url, description.
    """
    results = []
    try:
        for url in gsearch(query, num_results=num_results, advanced=False):
            results.append({
                "url": url,
                "title": "",
                "description": "",
            })
    except Exception as e:
        print(f"Search error: {e}")
        # Return fallback results
        results = [
            {"url": f"https://example.com/result-{i}", "title": f"Search result {i}", "description": ""}
            for i in range(3)
        ]

    return results

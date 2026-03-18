"""
Web Scraper Tool

Fetches web pages and extracts clean text content using httpx + BeautifulSoup.
"""

import httpx
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def scrape_url(url: str, max_chars: int = 3000) -> dict:
    """
    Fetch a URL and extract the main text content.
    Returns: {"url": str, "title": str, "content": str, "success": bool}
    """
    try:
        with httpx.Client(timeout=10.0, follow_redirects=True, headers=HEADERS) as client:
            response = client.get(url)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Get title
        title = soup.title.string.strip() if soup.title and soup.title.string else ""

        # Remove script, style, nav, footer, header elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "form", "iframe"]):
            tag.decompose()

        # Extract main content — prefer article or main tags
        main_content = soup.find("article") or soup.find("main") or soup.find("body")
        if main_content:
            text = main_content.get_text(separator="\n", strip=True)
        else:
            text = soup.get_text(separator="\n", strip=True)

        # Clean up: collapse multiple newlines, trim to max_chars
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        clean_text = "\n".join(lines)[:max_chars]

        return {
            "url": url,
            "title": title,
            "content": clean_text,
            "success": True,
        }

    except Exception as e:
        return {
            "url": url,
            "title": "",
            "content": f"Failed to scrape: {str(e)}",
            "success": False,
        }


def scrape_multiple(urls: list[str], max_per_page: int = 2000) -> list[dict]:
    """Scrape multiple URLs and return results."""
    results = []
    for url in urls[:5]:  # Limit to 5 pages
        result = scrape_url(url, max_chars=max_per_page)
        results.append(result)
    return results

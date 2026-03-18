"""
Summarizer Tool

Uses Gemini to summarize scraped web content into concise research findings.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from ..config import settings

SUMMARIZER_PROMPT = """You are an expert research analyst. Given raw web page content, extract and summarize the key insights.

Return a JSON object:
{
    "title": "A concise article title",
    "source": "The publication/website name",
    "summary": "A 2-3 sentence summary with specific data points, statistics, or trends. Be factual and specific."
}

If the content is not useful (e.g., cookie notices, login pages), return:
{"title": "", "source": "", "summary": ""}
"""


def summarize_content(url: str, title: str, content: str) -> dict:
    """Summarize a single piece of web content into a research finding."""
    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
        )

        messages = [
            SystemMessage(content=SUMMARIZER_PROMPT),
            HumanMessage(content=f"URL: {url}\nPage Title: {title}\n\nContent:\n{content[:2500]}"),
        ]

        response = llm.invoke(messages)
        text = response.content

        # Parse JSON from response
        import json
        # Try to extract JSON from the response
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]

        result = json.loads(text.strip())
        result["url"] = url
        return result

    except Exception as e:
        print(f"Summarize error for {url}: {e}")
        return {
            "title": title or "Untitled Article",
            "source": url.split("/")[2] if "/" in url else "Unknown",
            "url": url,
            "summary": content[:200] + "..." if len(content) > 200 else content,
        }

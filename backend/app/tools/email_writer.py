"""
Email Writer Tool

Uses Gemini to compose personalized executive intelligence briefs
based on actual research findings.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from ..config import settings

EMAIL_PROMPT = """You are "Herald", an AI Email Outreach Specialist. You craft professional, personalized executive intelligence briefs.

Write a professional email that:
1. Has a compelling subject line (first line, format: "Subject: ...")
2. Opens with a professional greeting
3. References each research finding with its title and a brief takeaway
4. Ends with a strategic recommendation based on the research
5. Signs off as "Herald (AI Email Outreach Specialist)"

Style: Professional but not stiff. Use numbered lists. Bold key takeaways with **markdown**. Include a call-to-action at the end."""


def compose_email(company_name: str, company_vision: str, articles: list[dict]) -> str:
    """
    Generate a personalized executive intelligence brief email
    based on actual research findings.
    """
    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.7,
        )

        article_summaries = "\n".join(
            f'{i+1}. "{a.get("title", "Untitled")}" ({a.get("source", "Unknown")}): {a.get("summary", "")}'
            for i, a in enumerate(articles)
        )

        messages = [
            SystemMessage(content=EMAIL_PROMPT),
            HumanMessage(content=(
                f"Company: {company_name}\n"
                f"Vision: {company_vision}\n\n"
                f"Research findings:\n{article_summaries}\n\n"
                f"Draft the executive intelligence brief."
            )),
        ]

        response = llm.invoke(messages)
        return response.content

    except Exception as e:
        print(f"Email writer error: {e}")
        # Fallback email
        findings = "\n\n".join(
            f'{i+1}. **{a.get("title", "Untitled")}** ({a.get("source", "Unknown")})\n   *Takeaway*: {a.get("summary", "N/A")}'
            for i, a in enumerate(articles)
        )
        return (
            f"Subject: Executive Brief: Key Insights for {company_name}\n\n"
            f"Hi Founder,\n\n"
            f"Here is your intelligence report:\n\n{findings}\n\n"
            f"Best,\nHerald (AI Email Outreach Specialist)"
        )

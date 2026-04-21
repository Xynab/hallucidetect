import wikipedia
from loguru import logger


def search_wikipedia(query: str):
    """
    Returns a list of evidence passages from Wikipedia.
    Never raises — always returns a list.
    """
    try:
        # Step 1: Search Wikipedia
        results = wikipedia.search(query)
        if not results:
            logger.warning(f"No Wikipedia results for: {query}")
            return []

        # Try top results until one works
        for title in results[:3]:
            try:
                page = wikipedia.page(title, auto_suggest=False)

                logger.info(f"Wikipedia evidence found: {page.title}")

                # Split summary into chunks for better NLI scoring
                text = page.summary or ""
                chunks = [p.strip() for p in text.split("\n") if p.strip()]

                return chunks[:3]  # return top 3 paragraphs

            except wikipedia.DisambiguationError as e:
                logger.warning(f"Disambiguation for '{title}', trying next option")
                continue

            except wikipedia.PageError:
                logger.warning(f"Wikipedia page not found: {title}")
                continue

        return []

    except Exception as e:
        logger.warning(f"Wikipedia search failed: {e}")
        return []
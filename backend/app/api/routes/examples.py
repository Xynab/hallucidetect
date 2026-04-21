from fastapi import APIRouter

router = APIRouter()

EXAMPLES = [
    {
        "id": 1,
        "title": "Einstein facts",
        "query": "Tell me about Albert Einstein",
        "response": (
            "Albert Einstein was born on March 14, 1879, in Ulm, Germany. "
            "He developed the theory of general relativity in 1915. "
            "Einstein won the Nobel Prize in Physics in 1921 for discovering the photoelectric effect. "
            "He also invented the telephone in 1876 and died in Princeton in 1955."
        ),
        "model_name": "gpt-4",
    },
    {
        "id": 2,
        "title": "Python language",
        "query": "What is the Python programming language?",
        "response": (
            "Python was created by Guido van Rossum and first released in 1991. "
            "It is an interpreted, high-level programming language. "
            "Python 3 was released in 2008 and is not backward compatible with Python 2. "
            "The language was named after Monty Python. "
            "Python has over 400,000 packages on PyPI and was originally developed at MIT in Boston."
        ),
        "model_name": "claude-3",
    },
    {
        "id": 3,
        "title": "Machine learning basics",
        "query": "Explain machine learning",
        "response": (
            "Machine learning is a subset of artificial intelligence that enables systems to learn from data. "
            "Deep learning uses neural networks with multiple layers. "
            "The transformer architecture, introduced in 2017, revolutionised NLP. "
            "BERT was released by Google in 2018. "
            "ChatGPT was launched by OpenAI in March 2021."
        ),
        "model_name": "llama-3",
    },
    {
        "id": 4,
        "title": "Tech company founders",
        "query": "Who founded major tech companies?",
        "response": (
            "Apple was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. "
            "Microsoft was founded by Bill Gates and Paul Allen in 1975. "
            "Google was founded by Larry Page and Sergey Brin in 1998. "
            "Amazon was founded by Jeff Bezos in 1994. "
            "Facebook was founded by Mark Zuckerberg in 2003."
        ),
        "model_name": "gemini-pro",
    },
]


@router.get("/examples", summary="Pre-built test examples")
async def get_examples():
    return {"examples": EXAMPLES}
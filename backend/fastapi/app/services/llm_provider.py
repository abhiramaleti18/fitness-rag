from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    api_key=settings.NVIDIA_API_KEY,
    base_url=settings.NVIDIA_BASE_URL
)


def get_completion(messages: list[dict]) -> str:
    """
    Send messages to the LLM and return the response text.
    All NVIDIA/LLM-specific code is isolated here — swapping providers
    later should only require changing this file.
    """
    completion = client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=messages,
        max_tokens=600,
        temperature=0.3  # lower temperature = more grounded, less creative
    )

    return completion.choices[0].message.content
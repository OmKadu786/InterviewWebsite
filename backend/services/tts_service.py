import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# We can reuse the same OPENAI_API_KEY
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    # Fallback to check if it's stored differently, though unlikely if main.py works
    print("WARNING: No OPENAI_API_KEY found in tts_service.")

client = OpenAI(api_key=api_key)

def generate_audio(text: str):
    try:
        # OpenAI TTS API
        # Docs: https://platform.openai.com/docs/guides/text-to-speech
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy", # Options: alloy, echo, fable, onyx, nova, shimmer
            input=text
        )

        # The response.content contains the audio binary
        return response.content

    except Exception as e:
        print(f"Error generating audio with OpenAI: {e}")
        return None
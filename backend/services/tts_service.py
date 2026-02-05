import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)

def generate_audio(text: str):
    try:
        # Default to "Adam" (Standard Free Voice) instead of "Rachel" to avoid "Library Voice" restrictions on free tiers
        voice_id = os.getenv("VOICE_ID", "pNInz6obpgDQGcFmaJgB") 
        
        # CHANGED: 'generate' is now 'text_to_speech.convert' in the new SDK
        audio_generator = client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_turbo_v2_5"
        )

        # Collect the generator chunks into a single bytes object
        audio_bytes = b"".join(list(audio_generator))
        return audio_bytes

    except Exception as e:
        print(f"Error generating audio: {e}")
        return None
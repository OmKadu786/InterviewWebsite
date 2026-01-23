from elevenlabs.client import ElevenLabs
import os

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
response = client.voices.get_all()

for voice in response.voices:
    print(f"Name: {voice.name} | ID: {voice.voice_id}")
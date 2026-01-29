import os
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

# Load the API Key from your .env file
load_dotenv()

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)

def get_voices():
    try:
        # The new SDK uses client.voices.get_all()
        response = client.voices.get_all()
        print(f"{'Name':<20} | {'Voice ID':<35}")
        print("-" * 60)
        for voice in response.voices:
            print(f"{voice.name:<20} | {voice.voice_id:<35}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_voices()
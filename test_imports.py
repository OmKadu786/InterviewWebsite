try:
    import fastapi
    import uvicorn
    import openai
    import elevenlabs
    import PyPDF2
    import dotenv
    import pydantic
    import websockets
    import cv2
    print("All imports successful!")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")

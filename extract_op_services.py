
import subprocess
import os

files_to_extract = [
    "backend/services/speech_analyzer.py",
    "backend/services/weakness_engine.py",
    "backend/services/logic_validator.py"
]

# Ensure backend/services directory exists (it should, but good to be safe)
os.makedirs("backend/services", exist_ok=True)

try:
    for file_path in files_to_extract:
        print(f"Extracting {file_path}...")
        try:
            result = subprocess.run(
                ["git", "show", f"local_OP:{file_path}"],
                capture_output=True,
                text=True,
                check=True,
                encoding='utf-8'
            )
            
            # Write to the actual destination
            output_filename = file_path.replace("/", os.sep)
            with open(output_filename, "w", encoding='utf-8') as f:
                f.write(result.stdout)
            print(f"Saved to {output_filename}")
            
        except subprocess.CalledProcessError as e:
            print(f"Error extracting {file_path}: {e}")
            print(f"Git STDERR: {e.stderr}")

except Exception as e:
    print(f"An error occurred: {e}")


import subprocess

files_to_extract = [
    "frontend/src/components/Analytics/WeaknessReport.tsx",
    "frontend/src/components/Interview/LogicFeedback.tsx"
]

try:
    for file_path in files_to_extract:
        print(f"Extracting {file_path}...")
        result = subprocess.run(
            ["git", "show", f"local_OP:{file_path}"],
            capture_output=True,
            text=True,
            check=True,
            encoding='utf-8'
        )
        
        output_filename = "temp_" + file_path.split("/")[-1]
        with open(output_filename, "w", encoding='utf-8') as f:
            f.write(result.stdout)
        print(f"Saved to {output_filename}")

except subprocess.CalledProcessError as e:
    print(f"Error executing git command: {e}")
    print(e.stderr)
except Exception as e:
    print(f"An error occurred: {e}")

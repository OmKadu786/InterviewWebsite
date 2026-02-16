
import subprocess

try:
    # Run git show to get the content of backend/main.py from the local_OP branch
    result = subprocess.run(
        ["git", "show", "local_OP:backend/main.py"],
        capture_output=True,
        text=True,
        check=True,
        encoding='utf-8'
    )
    
    # Write the content to a temporary file
    with open("temp_op_main.py", "w", encoding='utf-8') as f:
        f.write(result.stdout)
        
    print("Successfully wrote temp_op_main.py")

except subprocess.CalledProcessError as e:
    print(f"Error executing git command: {e}")
    print(e.stderr)
except Exception as e:
    print(f"An error occurred: {e}")

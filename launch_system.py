import subprocess
import time
import webbrowser
import os
import sys

def run_command(command, cwd, title):
    print(f"Starting {title}...")
    if sys.platform == "win32":
        # status = subprocess.Popen(['start', 'cmd', '/k', command], shell=True, cwd=cwd)
        # We use a simplified start command for better reliability
        os.system(f'start "{title}" /D "{cwd}" cmd /k "{command}"')
    elif sys.platform == "darwin":
        # macOS
        cwd_safe = cwd.replace('"', '\\"')
        cmd_safe = command.replace('"', '\\"')
        script = f'tell application "Terminal" to do script "cd \\"{cwd_safe}\\" && {cmd_safe}"'
        subprocess.run(["osascript", "-e", script])
    else:
        print(f"Platform {sys.platform} not fully supported for auto-launch. Run manually: {command}")

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("--- RIPIS LAUNCHER ---")
    print("0. Cleaning up ports...")
    if sys.platform == "win32":
        os.system("taskkill /F /IM python.exe >nul 2>&1")
        os.system("taskkill /F /IM node.exe >nul 2>&1")
    else:
        # Kill processes on ports 8000 (Backend) and 5173 (Frontend)
        os.system("lsof -ti:8000 | xargs kill -9 2>/dev/null")
        os.system("lsof -ti:5173 | xargs kill -9 2>/dev/null")
        
    time.sleep(1)

    print("1. Starting Backend (Port 8000)...")
    run_command("python main.py", backend_dir, "RIPIS Backend")
    
    time.sleep(2) # Give backend a moment
    
    print("2. Starting Frontend (Port 5173)...")
    run_command("npm run dev", frontend_dir, "RIPIS Frontend")
    
    print("3. Opening Browser...")
    time.sleep(3)
    webbrowser.open("http://localhost:5173")
    
    print("\nSUCCESS: System module launched.")
    print("Do not close the pop-up terminal windows.")
    input("Press Enter to exit this launcher (servers will keep running)...")

if __name__ == "__main__":
    main()

import os
import sys
import subprocess

# Ensure opencv-python and pillow are installed
try:
    import cv2
    from PIL import Image
except ImportError:
    print("Installing required packages (opencv-python, pillow)...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "opencv-python-headless", "pillow"])
    import cv2
    from PIL import Image

def extract_frames(video_path, output_dir, quality=80, scale=1.0):
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return

    os.makedirs(output_dir, exist_ok=True)

    # Open the video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / fps if fps > 0 else 0

    print(f"Video details:")
    print(f"  - Dimensions: {width}x{height}")
    print(f"  - Total Frames: {total_frames}")
    print(f"  - FPS: {fps:.2f}")
    print(f"  - Duration: {duration:.2f} seconds")

    # Clear existing frames in output directory
    for f in os.listdir(output_dir):
        if f.endswith('.webp') or f.endswith('.jpg'):
            try:
                os.remove(os.path.join(output_dir, f))
            except Exception as e:
                print(f"Failed to remove {f}: {e}")

    frame_count = 0
    saved_count = 0

    print("Extracting frames...")
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Convert frame from BGR (OpenCV) to RGB (PIL)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame_rgb)

        # Scale image if needed
        if scale != 1.0:
            new_size = (int(width * scale), int(height * scale))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        # Save as WebP
        frame_name = f"frame_{saved_count:04d}.webp"
        frame_path = os.path.join(output_dir, frame_name)
        img.save(frame_path, "WEBP", quality=quality)

        saved_count += 1
        frame_count += 1

        if frame_count % 30 == 0:
            print(f"  Processed {frame_count}/{total_frames} frames...")

    cap.release()
    print(f"Extraction complete! Saved {saved_count} frames to {output_dir}")

if __name__ == "__main__":
    video_path = r"C:\Users\gagan\Downloads\Hand_gripping_black_camera_1080p_202608281729.mp4"
    output_dir = r"C:\Users\gagan\uvclicks-app\public\frames"
    
    # We extract at full resolution with 80% WebP quality to keep sizes small but crisp
    extract_frames(video_path, output_dir, quality=80)

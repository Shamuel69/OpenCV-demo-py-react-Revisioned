# OpenCV-demo-py-react
Only version 1, and I'm proud to say more is coming in future development.

I wanted to blend my Python skills with my years of experience with OpenCV and see how well they get along with my web development skills.

## Simple overview
I wanted to make this project to give people with minimal experience in computer vision a chance to understand what and how computers see and interact with the information given to them.

This project is aimed toward people who struggle with OpenCV documentation, prefer a more hands-on experience, or want to test out aspects of image processing that they haven't been able to before.

Fit into any of these? Well, **WELCOME!**

## Current Features: 
 - Image Uploading
 - Gaussian blur
 - Median blur
 - Bilateral filtering
 - Canny edge detection
 - Threshold Configuration
 - Dynamic filter Configuration
 - OpenCV image processing
 - More to come in later versions!

## Future Improvements

- Real-time preview while adjusting filters.
- Additional image processing operations.
- Image export/download functionality.
- Improved mobile layout.
- More advanced configuration controls.

## Technologies

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Python
- Flask
- OpenCV
- NumPy

## How This Works
1. The user selects an image in the React frontend.
2. The image and processing configuration are sent to the Flask API.
3. Flask decodes the image using OpenCV.
4. The configured processing operations are applied.
5. The processed image is encoded and returned to the frontend.
6. React displays the processed image.

## How to Use

1. Start the Flask backend.
2. Start the React development server.
3. Open the application in your browser.
4. Upload an image.
5. Configure the desired processing options.
6. Submit the image.
7. View the processed result.


## Some notable experiences I gained while writing this code
- Connecting a React frontend to a Python backend.
- Sending images and configuration data using FormData.
- Creating Flask API endpoints.
- Encoding and decoding images with OpenCV.
- Passing processed image data back to a browser.
- Working with OpenCV image dimensions and channels.
- Building configurable image processing pipelines.
- Managing frontend state and user configuration.


## Installation

1. Clone the repository:

```bash
git clone https://github.com/Shamuel69/OpenCV-demo-py-react.git
cd OpenCV-demo-py-react
```

2. Set up the python backend:

Create a virtual environment:
```python -m venv venv```

Activate it on Windows:
```venv\Scripts\activate```

Install the required Python packages:
```pip install -r requirements.txt```

Start the Flask server:

```bash 
python server/main.py
```

The backend will run on:
```http://localhost:8080```

3. Set up the React frontend:

Open a second terminal and install the frontend dependencies:

```npm install```

Start the development server:

```npm run dev```

Vite will show you the local address to open in your browser.



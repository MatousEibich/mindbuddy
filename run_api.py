"""Run the FastAPI server for MindBuddy."""

import uvicorn


def main():
    """Run the API server."""
    uvicorn.run(
        "src.mindbuddy.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    main()

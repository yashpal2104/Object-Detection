import React, { useEffect, useState } from "react";
import "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "./ObjectDetection.css";

const ObjectDetection = () => {
  const [model, setModel] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [predictedValues, setPredictedValues] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          setImageSrc(img.src);
          setCanvasSize({ width: img.width, height: img.height });
          if (model) {
            predictImage(img);
          } else {
            console.error("Model has not loaded yet...");
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const predictImage = async (img) => {
    if (model) {
      const predictions = await model.detect(img);
      setPredictedValues(predictions);
    }
  };

  const drawPredictions = (ctx, predictions) => {
    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "24px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(
        `${prediction.class}: ${Math.round(prediction.score * 100)}%`,
        x,
        y > 10 ? y - 5 : 10,
      );
    });
  };

  return (
    <div className="ObjectDetection">
      <h1>Object Detection Component</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <div className="images-container">
        {imageSrc && (
          <div className="image-wrapper">
            <h3>Uploaded Image</h3>
            <img
              src={imageSrc}
              alt="Upload Preview"
              className="uploaded-image"
            />
          </div>
        )}
        {imageSrc && (
          <div className="image-wrapper">
            <h3>Predicted Image</h3>
            <canvas
              width={canvasSize.width}
              height={canvasSize.height}
              className="predicted-canvas"
              ref={(canvasRef) => {
                if (canvasRef && predictedValues.length > 0) {
                  const ctx = canvasRef.getContext("2d");
                  const canvasImg = new Image();
                  canvasImg.src = imageSrc;
                  canvasImg.onload = () => {
                    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
                    ctx.drawImage(canvasImg, 0, 0);
                    drawPredictions(ctx, predictedValues);
                  };
                }
              }}
            />
          </div>
        )}
      </div>
      {predictedValues.length > 0 && (
        <div>
          <h3>Predictions:</h3>
          {predictedValues.map((eachPrediction, index) => (
            <p
              key={index}
              style={{
                fontSize: "2rem",
                fontFamily: "monospace",
              }}
            >
              {eachPrediction.class}: {Math.round(eachPrediction.score * 100)}%
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectDetection;

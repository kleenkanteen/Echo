import functions from "@google-cloud/functions-framework";
import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

functions.http("describe", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed. Use POST.");
  }

  // for cors
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } 

  if (!process.env.GEMINI_API_KEY) {
    return res
      .status(500)
      .send("Server error: Missing GEMINI_API_KEY environment variable.");
  }

  try {
    const imageData = await parseMultipartForm(req);

    if (!imageData) {
      return res
        .status(400)
        .send(
          'Bad Request: No image uploaded. Please include an "image" field in the form data.',
        );
    }

    // Prepare the prompt
    const prompt = `Analyze this image and provide:
    1. A concise description of what you see in the image in 1 sentence max and 10 words max. If it is a person, guess what they are doing.
    2. An estimated distance range in feet from the camera to the main object/subject directly in front.

    Format your response as plain text with the description followed by the distance estimate.
    If you cannot confidently estimate the distance, please state that.
    
    Example responses would be:
    "A person standing using their phone in front of a house. It is about 10 feet away."
    "A busy traffic intersection. It is about 5 feet away."
    `;

    // Generate content using Gemini 1.5 Pro
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-09-2025",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.buffer.toString("base64"),
              },
            },
          ],
        },
      ],
    });

    const text = result.text;

    res.status(200).send(text);
  } catch (error) {
    console.error("Error processing image:", error);

    if (error.message && error.message.includes("API key")) {
      return res.status(401).send("Unauthorized: Invalid API key.");
    }

    return res.status(500).send(`Server error: ${error.message}`);
  }
});

function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const contentType =
      req.headers["content-type"] || req.headers["Content-Type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return reject(new Error("Content-Type must be multipart/form-data"));
    }

    const busboy = Busboy({
      headers: req.headers,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    });

    let imageData = null;
    let hasError = false;

    busboy.on("file", (fieldname, file, info) => {
      if (fieldname !== "image") {
        file.resume(); // Drain the stream
        return;
      }

      const { filename, mimeType } = info;
      const chunks = [];

      file.on("data", (chunk) => {
        chunks.push(chunk);
      });

      file.on("end", () => {
        if (!hasError) {
          imageData = {
            buffer: Buffer.concat(chunks),
            filename,
            mimeType,
          };
        }
      });

      file.on("error", (error) => {
        hasError = true;
        reject(error);
      });
    });

    busboy.on("finish", () => {
      if (!hasError) {
        resolve(imageData);
      }
    });

    busboy.on("error", (error) => {
      hasError = true;
      reject(error);
    });

    // Handle raw body if it exists (Cloud Functions v2)
    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  });
}

const express = require('express');
const multer = require('multer');
const { removeBackground } = require('@imgly/background-removal-node');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 6789;

app.use(cors());
// Allow parsing of large JSON payloads (up to 25MB)
app.use(express.json({ limit: '25mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 15 * 1024 * 1024 } });

app.post('/api/remove-bg', upload.single('file'), async (req, res) => {
  try {
    let buffer;
    
    // 1. Check if uploaded via FormData file
    if (req.file) {
      buffer = req.file.buffer;
      console.log(`[BG] Received binary file: ${req.file.originalname} (${req.file.size} bytes)`);
    } 
    // 2. Check if uploaded via Base64 JSON body
    else if (req.body && req.body.image) {
      buffer = Buffer.from(req.body.image, 'base64');
      console.log(`[BG] Received base64 image (${buffer.length} bytes)`);
    }

    let inputForImgly = buffer;
    if (req.body && req.body.image) {
      // Pass it as a Blob with the correct mime type, which @imgly supports natively!
      inputForImgly = new Blob([buffer], { type: 'image/jpeg' });
    }

    if (!inputForImgly) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // 3. Process background removal
    const transparentBlob = await removeBackground(inputForImgly);
    const arrayBuffer = await transparentBlob.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);

    // 4. Convert to base64 string for response
    const base64Image = outputBuffer.toString('base64');

    return res.json({
      success: true,
      mimeType: 'image/png',
      base64: base64Image
    });

  } catch (error) {
    console.error("[BG Error]", error);
    return res.status(500).json({ error: 'Background removal failed' });
  }
});

app.listen(port, () => console.log(`BG Isolation Engine running on port ${port}`));

const express = require('express');
const multer = require('multer');
const { removeBackground } = require('@imgly/background-removal-node');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 6789;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 15 * 1024 * 1024 } });

app.post('/api/remove-bg', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Process background removal in isolation
    const transparentBlob = await removeBackground(req.file.buffer);
    const arrayBuffer = await transparentBlob.arrayBuffer();
    const outputBuffer = Buffer.from(arrayBuffer);

    // 2. Convert to base64 string for trouble-free React Native transfer
    const base64Image = outputBuffer.toString('base64');

    return res.json({
      success: true,
      mimeType: 'image/png',
      base64: base64Image
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Background removal failed' });
  }
});

app.listen(port, () => console.log(`BG Isolation Engine running on port ${port}`));

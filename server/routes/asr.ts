import express from 'express';

const router = express.Router();

router.post('/recognize', async (req: any, res: any) => {
  try {
    const { audioData, format } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData' });
    }

    console.log('[ASR] Request received, format:', format || 'unknown');

    // 动态导入SDK
    const sdk = require('coze-coding-dev-sdk');
    const config = new sdk.Config();
    const customHeaders = sdk.HeaderUtils.extractForwardHeaders(req.headers);
    const client = new sdk.ASRClient(config, customHeaders);

    const result = await client.recognize({
      uid: `user_${Date.now()}`,
      base64Data: audioData,
      audioFormat: format || 'webm'
    });

    console.log('[ASR] Result:', result);
    
    res.json({
      text: result.text || '',
      duration: result.duration || 0
    });
  } catch (error: any) {
    console.error('[ASR] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;

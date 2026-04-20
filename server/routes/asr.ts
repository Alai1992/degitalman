import { Router } from 'express';
import { ASRClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = Router();

// 语音识别接口
router.post('/recognize', async (req, res) => {
  try {
    const { audioData, format = 'webm' } = req.body;

    if (!audioData) {
      res.status(400).json({ error: '缺少音频数据' });
      return;
    }

    console.log(`[ASR] 收到语音识别请求，格式: ${format}`);

    // 提取请求头并转发到SDK（关键步骤！）
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    
    const config = new Config();
    const client = new ASRClient(config, customHeaders);

    const result = await client.recognize({
      uid: `user_${Date.now()}`,
      base64Data: audioData,
    });

    console.log(`[ASR] 识别结果: ${result.text}`);

    res.json({
      text: result.text || '',
      duration: result.duration || 0,
    });
  } catch (error) {
    console.error('[ASR] 识别失败:', error);
    res.status(500).json({ error: '语音识别失败' });
  }
});

export default router;

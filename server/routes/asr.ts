import { Router } from 'express';
import { ASRClient, Config } from 'coze-coding-dev-sdk';

const router = Router();

// 语音识别接口
router.post('/', async (req, res) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      res.status(400).json({ error: '缺少音频数据' });
      return;
    }

    // 创建 ASR 客户端
    const client = new ASRClient();
    
    // 调用 ASR 识别
    const result = await client.recognize({
      uid: `user_${Date.now()}`,
      base64Data: audioData,
    });

    res.json({
      text: result.text || '',
      duration: result.duration || 0,
      success: true,
    });
  } catch (error) {
    console.error('ASR 识别失败:', error);
    res.status(500).json({ 
      error: 'ASR 识别失败', 
      message: error instanceof Error ? error.message : '未知错误' 
    });
  }
});

export default router;

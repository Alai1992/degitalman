import express, { Request, Response } from 'express';
import { ASRClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = express.Router();

router.post('/recognize', async (req: Request, res: Response) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: '缺少音频数据' });
    }
    
    console.log('[ASR] 收到请求，音频数据长度:', audioData.length);
    
    // 提取请求头并转发到SDK（关键步骤！）
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const config = new Config();
    const client = new ASRClient(config, customHeaders);
    
    // 调用 ASR 识别 - 确保参数格式正确
    const result = await client.recognize({
      uid: `user_${Date.now()}`,
      base64Data: audioData,
      // 可能需要添加其他参数
    });
    
    console.log('[ASR] 识别成功:', result.text);
    
    return res.json({
      text: result.text || '',
      duration: result.duration,
    });
  } catch (error: any) {
    console.error('[ASR] 识别失败:', error?.response?.data || error.message);
    
    return res.status(500).json({
      error: error?.message || '识别失败',
      details: error?.response?.data,
    });
  }
});

export default router;

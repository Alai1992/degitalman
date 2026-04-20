import { Router } from 'express';
import { ASRClient, Config } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 语音识别接口
router.post('/api/asr', async (req, res) => {
  try {
    const { audioData } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: '缺少音频数据' });
    }
    
    // 保存临时音频文件
    const tempDir = '/tmp';
    const fileName = `voice_${uuidv4()}.webm`;
    const filePath = path.join(tempDir, fileName);
    
    // 将base64转换为音频文件
    const audioBuffer = Buffer.from(audioData, 'base64');
    fs.writeFileSync(filePath, audioBuffer);
    
    // 调用ASR识别
    const config = new Config();
    const client = new ASRClient(config);
    
    const result = await client.recognize({
      uid: 'voice_user',
      url: `file://${filePath}`
    });
    
    // 清理临时文件
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // 忽略删除错误
    }
    
    res.json({
      success: true,
      text: result.text,
      duration: result.duration
    });
  } catch (error: any) {
    console.error('ASR error:', error);
    res.status(500).json({ 
      error: '语音识别失败',
      message: error.message 
    });
  }
});

export default router;

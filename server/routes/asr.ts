import { Router } from 'express';
import { ASRClient, Config } from 'coze-coding-dev-sdk';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const router = Router();

// 语音识别
router.post('/recognize', async (req, res) => {
  try {
    const { audioData, format = 'webm' } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: '缺少音频数据' });
    }

    // 保存音频文件
    const filename = `${randomUUID()}.${format}`;
    const filepath = path.join('/tmp', filename);
    
    // 解码base64并保存
    const buffer = Buffer.from(audioData, 'base64');
    fs.writeFileSync(filepath, buffer);

    // 调用ASR识别
    const config = new Config();
    const asrClient = new ASRClient(config);

    const result = await asrClient.recognize({
      uid: randomUUID(),
      url: `file://${filepath}`
    });

    // 清理临时文件
    fs.unlinkSync(filepath);

    res.json({
      success: true,
      text: result.text,
      duration: result.duration
    });
  } catch (error) {
    console.error('ASR Error:', error);
    res.status(500).json({ error: '语音识别失败' });
  }
});

export default router;

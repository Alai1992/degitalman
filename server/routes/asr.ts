import { Router } from 'express';
import { randomUUID } from 'crypto';

const router = Router();

// 测试端点 - 检查路由是否正确注册
router.get('/test', (req, res) => {
  console.log('[ASR] 测试端点被调用');
  res.json({ success: true, message: 'ASR路由正常' });
});

// 语音识别
router.post('/recognize', async (req, res) => {
  try {
    console.log('[ASR] 收到识别请求');
    const { audioData, format = 'webm' } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ success: false, error: '缺少音频数据' });
    }

    console.log('[ASR] 音频数据长度:', audioData.length);

    // TODO: 调用豆包ASR服务进行语音识别
    // 目前返回模拟结果
    const mockText = '这是模拟的语音识别结果';

    console.log('[ASR] 返回结果:', mockText);

    res.json({
      success: true,
      text: mockText,
      duration: 0
    });
  } catch (error: any) {
    console.error('[ASR] Error:', error?.message || error);
    console.error('[ASR] Stack:', error?.stack);
    res.status(500).json({ success: false, error: error?.message || '语音识别失败' });
  }
});

export default router;

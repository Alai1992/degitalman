import { Router, Request, Response } from 'express';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const router = Router();

// 老年男性语音配置
const VOICE_CONFIG = {
  speaker: 'zh_male_m191_uranus_bigtts', // 云舟 - 老年男性声音
  speechRate: 0, // 正常语速
  audioFormat: 'mp3' as const,
  sampleRate: 24000
};

// TTS API - 生成语音
router.post('/api/tts', async (req: Request, res: Response) => {
  const { text, sessionId } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: '缺少文本内容' });
  }
  
  try {
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const ttsClient = new TTSClient(config, customHeaders);
    
    const response = await ttsClient.synthesize({
      uid: sessionId || 'veteran-chat',
      text,
      ...VOICE_CONFIG
    });
    
    // 下载音频到本地
    const audioDir = path.join(process.cwd(), 'public', 'tts-audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(audioDir, filename);
    
    const audioData = await axios.get(response.audioUri, { responseType: 'arraybuffer' });
    fs.writeFileSync(filepath, audioData.data);
    
    return res.json({ 
      audioUrl: `/tts-audio/${filename}`,
      audioSize: response.audioSize
    });
  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: '语音合成失败' });
  }
});

// 流式TTS API - 生成语音并流式传输
router.post('/api/tts/stream', async (req: Request, res: Response) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: '缺少文本内容' });
  }
  
  try {
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const ttsClient = new TTSClient(config, customHeaders);
    
    const response = await ttsClient.synthesize({
      uid: 'veteran-stream',
      text,
      ...VOICE_CONFIG
    });
    
    // 设置响应头
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline');
    
    // 流式传输音频
    const audioResponse = await axios.get(response.audioUri, { responseType: 'stream' });
    audioResponse.data.pipe(res);
  } catch (error) {
    console.error('TTS stream error:', error);
    res.status(500).json({ error: '语音合成失败' });
  }
});

export default router;

import { TTSClient, Config } from 'coze-coding-dev-sdk';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function generateSong() {
  const config = new Config();
  const client = new TTSClient(config);

  // 中国人民志愿军战歌歌词
  const lyrics = `雄赳赳，气昂昂，跨过鸭绿江。
保和平，卫祖国，就是保家乡。
中国好儿女，齐心团结紧。
抗美援朝，打败美帝野心狼！`;

  console.log('正在生成战歌音频...');
  
  const response = await client.synthesize({
    uid: 'song-generate',
    text: lyrics,
    speaker: 'zh_male_m191_uranus_bigtts', // 男声更适合军歌
    audioFormat: 'mp3',
    speechRate: 10, // 稍快节奏，符合军歌特点
    loudnessRate: 10 // 音量增强
  });

  console.log('下载音频文件...');
  
  const audioData = await axios.get(response.audioUri, { responseType: 'arraybuffer' });
  
  const outputPath = '/workspace/projects/public/audio/song.mp3';
  fs.writeFileSync(outputPath, audioData.data);
  
  console.log(`音频已保存到: ${outputPath}`);
  console.log(`文件大小: ${response.audioSize} bytes`);
}

generateSong().catch(console.error);

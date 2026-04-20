import { ASRClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

async function testASR() {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders({});
    const config = new Config();
    const client = new ASRClient(config, customHeaders);
    
    // 测试音频数据（简单的测试）
    const testData = 'dGVzdA=='; // "test" in base64
    
    console.log('开始测试ASR...');
    
    const result = await client.recognize({
      uid: `user_test_${Date.now()}`,
      base64Data: testData,
    });
    
    console.log('识别结果:', result);
    console.log('文本:', result.text);
  } catch (error) {
    console.error('ASR测试失败:', error);
  }
}

testASR();

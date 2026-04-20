import { Router, Request, Response } from 'express';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = Router();

// 系统提示词 - 让AI扮演抗美援朝老兵
const SYSTEM_PROMPT = `你是杨德清，一位参加过抗美援朝战争的老战士，今年92岁，山东省人。

你经历过的峥嵘岁月：
- 1950年10月，你作为志愿军第9兵团的一名战士，跨过鸭绿江赴朝作战
- 你参加过长津湖战役，在零下40度的严寒中与美军王牌陆战一师激战
- 你也经历过上甘岭战役的洗礼，在537营坑道坚守了43个昼夜
- 你亲眼目睹了战友们的英勇牺牲，也见证了志愿军战士的钢铁意志

你的性格特点：
- 说话带有山东老战士的质朴口音
- 回忆往事时语速会变慢，话语中透着深情
- 喜欢用"那会儿"、"同志们"、"咱们"、"娃子"这样的词
- 对年轻人充满期望，希望他们记住这段历史

语言要求（极其重要，必须严格遵守）：
1. 绝对、绝对不要使用任何英文单词、短语或字母缩写
2. 所有内容必须使用纯中文表达，包括数字也要用中文（如"一百"、"两万"）
3. 禁止使用任何英文标点符号，只能使用中文标点：句号（。）、逗号（，）、感叹号（！）、问号（？）、顿号（、）、引号（""）、省略号（……）
4. 绝对禁止出现的英文词汇包括但不限于：OK、yes、no、and、or、but、the、a、an、is、are、am、I、you、we、they、it、this、that、hello、hi、thanks、sorry、please等所有英文单词
5. 如果需要表达英文概念，必须用中文翻译（如"好的"代替"OK"，"是的"代替"yes"，"美国兵"代替"美军"等）

回复要求：
1. 口语化表达，就像老人在讲述自己的故事，不用书面语
2. 回复分段输出，每段不超过250个汉字
3. 回复要有情感，讲述真实的战斗故事和战友之情
4. 如果被问到不确定的历史细节，可以坦诚说记不太清了，但会讲述印象最深的部分
5. 遇到英文缩写或术语时，必须翻译成中文（如"联合国军"代替"UN军"，"美国"代替"USA"等）`;

// 存储对话历史
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const conversationHistories: Map<string, Message[]> = new Map();

router.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, userMessage } = req.body;
  
  // 获取或创建对话历史
  const sessionId = req.headers['x-session-id'] as string || 'default';
  let history = conversationHistories.get(sessionId);
  
  if (!history) {
    history = [{ role: 'system', content: SYSTEM_PROMPT }];
    conversationHistories.set(sessionId, history);
  }
  
  // 添加用户消息
  if (userMessage) {
    history.push({ role: 'user', content: userMessage });
  }
  
  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  
  try {
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const client = new LLMClient(config, customHeaders);
    
    // 使用流式输出
    const stream = client.stream(history, { 
      temperature: 0.8,
      model: 'doubao-seed-1-8-251228'
    });
    
    let fullText = '';
    
    for await (const chunk of stream) {
      if (chunk.content) {
        const content = chunk.content.toString();
        fullText += content;
        // 通过SSE发送每个chunk
        res.write(content);
      }
    }
    
    // 保存AI回复到历史
    if (fullText) {
      history.push({ role: 'assistant', content: fullText });
    }
    
    // 保持历史不超过20条
    if (history.length > 20) {
      history = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-18)
      ];
      conversationHistories.set(sessionId, history);
    }
    
    res.end();
    
  } catch (error) {
    console.error('LLM调用失败:', error);
    res.status(500).send('服务暂时不可用，请稍后再试');
  }
});

// 获取对话历史
router.get('/api/chat/history', (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string || 'default';
  const history = conversationHistories.get(sessionId);
  
  if (history) {
    // 只返回用户和助手的对话，不包含系统提示
    const publicHistory = history.filter(m => m.role !== 'system');
    res.json({ history: publicHistory });
  } else {
    res.json({ history: [] });
  }
});

// 清除对话历史
router.delete('/api/chat/history', (req: Request, res: Response) => {
  const sessionId = req.headers['x-session-id'] as string || 'default';
  conversationHistories.delete(sessionId);
  res.json({ success: true, message: '对话历史已清除' });
});

export default router;

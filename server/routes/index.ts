import { Router, Request, Response, NextFunction } from 'express';
import chatRouter from './chat';
import asrRouter from './asr';

const router = Router();

// 日志中间件
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Router] ${req.method} ${req.path}`);
  next();
});

// API 路由示例
router.get('/api/hello', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from Express + Vite!',
    timestamp: new Date().toISOString(),
  });
});

router.post('/api/data', (req: Request, res: Response) => {
  const requestData = req.body;
  res.json({
    success: true,
    data: requestData,
    receivedAt: new Date().toISOString(),
  });
});

// 健康检查接口
router.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    env: process.env.COZE_PROJECT_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 聊天接口
router.use(chatRouter);

// 语音识别接口
router.use(asrRouter);

// 导出路由注册函数
export function registerRoutes(app: { use: (path: string, router: Router) => void }) {
  // 使用通配符确保所有 /api/* 路由都由 Express 处理
  app.use('/api', router);
}

export default router;

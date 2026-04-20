import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { registerRoutes } from './routes/index.js';

// 创建Express应用
const app: Express = express();

// CORS配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 日志中间件
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[Express] ${req.method} ${req.path}`);
  next();
});

// 注册API路由
registerRoutes(app);

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Express API server running on http://localhost:${PORT}`);
});

export default app;

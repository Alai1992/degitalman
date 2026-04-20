// ABOUTME: Vite integration for Express server
// ABOUTME: Handles dev middleware and production static file serving

import type { Application, Request, Response } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import viteConfig from '../vite.config';

const isDev = process.env.COZE_PROJECT_ENV !== 'PROD';

/**
 * 集成 Vite 开发服务器（中间件模式）
 */
export async function setupViteMiddleware(app: Application) {
  const vite = await createViteServer({
    ...viteConfig,
    server: {
      ...viteConfig.server,
      middlewareMode: true,
    },
    appType: 'spa',
  });

  // ASR 语音识别路由（直接内联，避免TS模块解析问题）
  // 必须放在所有中间件之前，确保优先匹配
  app.post('/api/asr/recognize', async (req: any, res: any) => {
    try {
      const { audioData, format } = req.body;
      
      if (!audioData) {
        res.status(400).json({ error: 'Missing audioData' });
        return;
      }

      console.log('[ASR] Request received, format:', format || 'unknown');

      // 动态导入SDK
      const sdk = require('coze-coding-dev-sdk');
      const config = new sdk.Config();
      const customHeaders = sdk.HeaderUtils.extractForwardHeaders(req.headers);
      const client = new sdk.ASRClient(config, customHeaders);

      const result = await client.recognize({
        uid: `user_${Date.now()}`,
        base64Data: audioData,
        audioFormat: format || 'webm'
      });

      console.log('[ASR] Result:', result);
      
      res.json({
        text: result.text || '',
        duration: result.duration || 0
      });
    } catch (error: any) {
      console.error('[ASR] Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // 确保 /api 请求不会被 Vite 中间件拦截
  app.use((req: Request, _res: Response, next) => {
    if (req.path.startsWith('/api')) {
      // API 请求，跳过 Vite 中间件
      // 但不调用 next('router')，让 Express 继续匹配其他路由
    } else {
      next();
    }
  });

  // 使用 Vite middleware（处理所有其他请求）
  app.use(vite.middlewares);

  console.log('🚀 Vite dev server initialized');
}

/**
 * 设置生产环境静态文件服务
 */
export function setupStaticServer(app: Application) {
  const distPath = path.resolve(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Please run "pnpm build" first.');
    process.exit(1);
  }

  // 1. 服务静态文件（如果存在对应文件则直接返回）
  app.use(express.static(distPath));

  // 2. SPA fallback - 所有未处理的请求返回 index.html
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log('📦 Serving static files from dist/');
}

/**
 * 根据环境设置 Vite
 */
export async function setupVite(app: Application) {
  if (isDev) {
    await setupViteMiddleware(app);
  } else {
    setupStaticServer(app);
  }
}

export function initApp(): void {
  // 处理模块卡片的点击事件
  const moduleCards = document.querySelectorAll('.module-card');
  const mainPage = document.querySelector('.main-page') as HTMLElement;
  const subPage = document.getElementById('sub-page') as HTMLElement;
  const subContent = document.querySelector('.sub-content') as HTMLElement;
  const backButton = document.getElementById('backBtn') as HTMLElement;

  if (!mainPage || !subPage) {
    console.error('Required elements not found');
    return;
  }

  // 为每个模块卡片添加点击事件
  moduleCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const target = card.getAttribute('href');
      
      if (target) {
        // 数字人授课模块跳转到专门页面
        if (target.includes('digital-lecture')) {
          window.location.href = target;
          return;
        }
        
        // 互动探究模块跳转到聊天页面
        if (target.includes('interactive-explore')) {
          window.location.href = target;
          return;
        }
        
        // 其他锚点跳转
        if (target.startsWith('#')) {
          const moduleId = target.substring(1);
          showSubPage(moduleId);
        }
      }
    });
  });

  // 返回按钮事件
  if (backButton) {
    backButton.addEventListener('click', () => {
      mainPage.style.display = 'block';
      subPage.style.display = 'none';
    });
  }

  // 显示子页面
  function showSubPage(moduleId: string): void {
    const moduleNames: Record<string, { title: string; icon: string; desc: string }> = {
      'digital-lecture': {
        title: '数字人授课',
        icon: '🎖️',
        desc: '通过数字人技术，重现抗美援朝老兵的生动讲述，让历史仿佛就在眼前。'
      },
      'interactive-explore': {
        title: '互动探究',
        icon: '🔍',
        desc: '沉浸式体验历史场景，通过互动探究深入了解那段峥嵘岁月。'
      },
      'learning-support': {
        title: '学习支持',
        icon: '📚',
        desc: '提供丰富的历史资料、学习资源和辅助工具，支持深入学习。'
      }
    };

    const module = moduleNames[moduleId];
    
    if (module) {
      subContent.innerHTML = `
        <div class="sub-page-content">
          <div class="sub-page-header">
            <div class="sub-page-icon">${module.icon}</div>
            <h1 class="sub-page-title">${module.title}</h1>
            <p class="sub-page-desc">${module.desc}</p>
          </div>
          <div class="sub-page-body">
            <div class="coming-soon">
              <div class="coming-soon-icon">🚧</div>
              <h2>模块开发中</h2>
              <p>该模块正在紧张开发中，敬请期待...</p>
            </div>
          </div>
        </div>
      `;
      
      mainPage.style.display = 'none';
      subPage.style.display = 'block';
      
      // 添加子页面样式
      addSubPageStyles();
    }
  }

  // 添加子页面样式
  function addSubPageStyles(): void {
    let style = document.getElementById('sub-page-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'sub-page-styles';
      document.head.appendChild(style);
    }
    
    style.textContent = `
      .sub-page-content {
        animation: fadeIn 0.5s ease-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .sub-page-header {
        text-align: center;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 2px solid rgba(218, 165, 32, 0.3);
      }
      
      .sub-page-icon {
        font-size: 5rem;
        margin-bottom: 1.5rem;
        filter: drop-shadow(0 0 15px rgba(218, 165, 32, 0.5));
      }
      
      .sub-page-title {
        font-size: 2.5rem;
        color: #DAA520;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        font-family: 'Noto Serif SC', serif;
      }
      
      .sub-page-desc {
        font-size: 1.2rem;
        color: #F5F5DC;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.8;
        opacity: 0.9;
      }
      
      .sub-page-body {
        text-align: center;
        padding: 4rem 2rem;
      }
      
      .coming-soon {
        background: linear-gradient(135deg, rgba(139, 0, 0, 0.3), rgba(107, 15, 26, 0.3));
        border: 2px solid rgba(218, 165, 32, 0.5);
        border-radius: 16px;
        padding: 3rem;
        max-width: 500px;
        margin: 0 auto;
      }
      
      .coming-soon-icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
      }
      
      .coming-soon h2 {
        font-size: 1.8rem;
        color: #DAA520;
        margin-bottom: 1rem;
        font-family: 'Noto Serif SC', serif;
      }
      
      .coming-soon p {
        font-size: 1rem;
        color: #F5F5DC;
        opacity: 0.8;
        line-height: 1.6;
      }
    `;
  }

  // 添加按钮点击效果
  moduleCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
    });
  });

  console.log('抗美援朝老兵数字人应用已初始化');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}

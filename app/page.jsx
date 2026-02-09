const highlights = [
  {
    title: '星曜鈦金屬機身',
    description: '全新「星曜鈦」打造更輕盈機身，帶來宛如星際流光的質感。',
  },
  {
    title: 'A19 Hyper 晶片',
    description: '下一代 3 奈米架構，跨場景 AI 融合運算速度提升 45%。',
  },
  {
    title: '超級視網膜 XDR 2.0',
    description: '峰值亮度 3000 尼特，戶外強光下依然清晰震撼。',
  },
];

const specs = [
  { label: '螢幕', value: '6.8 吋超級視網膜 XDR 2.0' },
  { label: '處理器', value: 'A19 Hyper · 16 核心神經引擎' },
  { label: '相機', value: '48MP Ultra Fusion 三鏡頭' },
  { label: '續航', value: '最長 32 小時影片播放' },
  { label: '充電', value: 'MagSafe 30W 快充' },
  { label: '連線', value: 'Wi-Fi 7 + 衛星通訊 2.0' },
];

const stories = [
  {
    title: '夜拍更純淨',
    description: '全新光子引擎重構暗部細節，夜景噪點減少 60%。',
  },
  {
    title: '空間錄影',
    description: '空間影片升級 8K，戴上 Vision 裝置立即沉浸。',
  },
  {
    title: '專屬 Apple Intelligence',
    description: '端上運算個人化助理，隱私全面內建。',
  },
];

export default function Home() {
  return (
    <div className="page">
      <header className="hero">
        <nav className="nav">
          <div className="logo">Apple</div>
          <div className="nav-links">
            <a href="#highlights">亮點</a>
            <a href="#specs">規格</a>
            <a href="#experience">體驗</a>
            <button className="nav-cta">立即預購</button>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">iPhone 18 Pro</p>
            <h1>
              讓未來
              <span>親手掌握</span>
            </h1>
            <p className="hero-description">
              全新 iPhone 18 Pro，以星曜鈦金屬、A19 Hyper 晶片與超級視網膜 XDR 2.0，
              帶來超越想像的智慧體驗。
            </p>
            <div className="hero-actions">
              <button className="primary">立即預購</button>
              <button className="ghost">觀看發表會</button>
            </div>
            <div className="hero-meta">
              <div>
                <h3>9/20 起</h3>
                <p>全球同步上市</p>
              </div>
              <div>
                <h3>NT$43,900 起</h3>
                <p>最高 36 期分期零利率</p>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top">
              <span>iPhone 18 Pro</span>
              <span>星曜鈦</span>
            </div>
            <div className="hero-ring" />
            <div className="hero-stats">
              <div>
                <strong>30%</strong>
                <span>更輕盈</span>
              </div>
              <div>
                <strong>45%</strong>
                <span>AI 效能提升</span>
              </div>
              <div>
                <strong>32hr</strong>
                <span>續航</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="highlights" className="section">
        <div className="section-title">
          <p>新世代突破</p>
          <h2>更薄、更快、更聰明</h2>
        </div>
        <div className="card-grid">
          {highlights.map((item) => (
            <article key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="specs" className="section specs">
        <div>
          <h2>規格總覽</h2>
          <p>
            每一項細節都為最極致的體驗而打造，從顯示到續航都全面升級。
          </p>
          <button className="primary">探索完整規格</button>
        </div>
        <div className="specs-list">
          {specs.map((spec) => (
            <div key={spec.label} className="spec-item">
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section id="experience" className="section experience">
        <div className="section-title">
          <p>沉浸體驗</p>
          <h2>重塑你的創作方式</h2>
        </div>
        <div className="experience-grid">
          {stories.map((story) => (
            <article key={story.title}>
              <h3>{story.title}</h3>
              <p>{story.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta">
        <div>
          <h2>準備好迎接 iPhone 18 Pro 嗎？</h2>
          <p>加入預購名單，第一時間體驗未來。</p>
        </div>
        <button className="primary">加入預購名單</button>
      </section>

      <footer className="footer">
        <p>© 2025 Apple Inc. 此為概念宣傳網站。</p>
      </footer>
    </div>
  );
}

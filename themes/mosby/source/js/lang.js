/* ============================================
   Mosby 三语切换（界面文案）
   中文 / English / 日本語
   仅切换 UI 文案，文章正文保持原文。
   data-i18n 标记优先；带 data-i18n-attr 的
   元素按 attr 切换属性（如 menu 键、column 键）。
   ============================================ */
(function () {
  var I18N = {
    zh: {
      'lang.zh': '中',
      'lang.en': 'EN',
      'lang.ja': '日',
      'nav.home': '首页',
      'nav.diary': '日记',
      'nav.essay': '杂谈',
      'nav.dev': '开发',
      'nav.archive': '归档',
      'nav.tags': '标签',
      'nav.about': '关于',
      'col.diary.name': '日记',
      'col.diary.desc': '记录生活的琐碎日常',
      'col.essay.name': '杂谈',
      'col.essay.desc': '漫无边际的想法与闲聊',
      'col.dev.name': '开发',
      'col.dev.desc': '代码、工具与折腾笔记',
      'tagline': '生活与学习的琐事',
      'intro': '这里是我的自留地：写点日记，偶尔杂谈，也记录开发时的折腾。不追热点，不赶节奏，只是安静地写。',
      'stat.posts': '篇文章',
      'stat.tags': '个标签',
      'stat.categories': '个专栏',
      'footer': '© 2026 早坂直治 · Built with Hexo',
      'page.index': 'INDEX',
      'page.archives': '归档',
      'page.categories': '专栏',
      'page.category': '分类',
      'page.tags': '标签',
      'page.tag': '标签',
      'page.archive.title': '归档',
      'page.categories.title': '专栏',
      'page.tags.title': '标签',
      'cat.count': '篇',
      'cat.sub': '个专栏',
      'tag.sub': '个标签',
      'related.posts': '篇相关文章',
      'about.p1': '你好，我是早坂直治。',
      'about.p2': '这里是我的一块自留地。平日写点日记，记录生活的琐碎；有时也发发杂谈，说说漫无边际的想法；开发相关的折腾则单独收在一个栏目里。',
      'about.p3': '博客用 Hexo 搭建，主题 mosby 是自己照着喜欢的极简风格一点点改出来的，部署在 GitHub Pages 上。',
      'about.p4': '不追热点，不赶节奏，只图一个能安静写字的地方。欢迎随便看看，也可以到 GitHub 上找我。'
    },
    en: {
      'lang.zh': '中',
      'lang.en': 'EN',
      'lang.ja': '日',
      'nav.home': 'Home',
      'nav.diary': 'Diary',
      'nav.essay': 'Essays',
      'nav.dev': 'Dev',
      'nav.archive': 'Archive',
      'nav.tags': 'Tags',
      'nav.about': 'About',
      'col.diary.name': 'Diary',
      'col.diary.desc': 'Notes on everyday life',
      'col.essay.name': 'Essays',
      'col.essay.desc': 'Wandering thoughts and chatter',
      'col.dev.name': 'Dev',
      'col.dev.desc': 'Code, tools and tinkering',
      'tagline': 'Life and learning, in passing',
      'intro': 'This is my corner of the internet: a diary here, the occasional essay there, and notes on building things in between. No hot takes, no rush — just quiet writing.',
      'stat.posts': 'posts',
      'stat.tags': 'tags',
      'stat.categories': 'columns',
      'footer': '© 2026 Hayasaka Naoji · Built with Hexo',
      'page.index': 'INDEX',
      'page.archives': 'Archive',
      'page.categories': 'Columns',
      'page.category': 'Category',
      'page.tags': 'Tags',
      'page.tag': 'Tag',
      'page.archive.title': 'Archive',
      'page.categories.title': 'Columns',
      'page.tags.title': 'Tags',
      'cat.count': ' posts',
      'cat.sub': 'columns',
      'tag.sub': 'tags',
      'related.posts': 'related posts',
      'about.p1': 'Hello, I am Hayasaka Naoji.',
      'about.p2': 'This is my own little corner. I keep a diary of everyday life, occasionally jot down wandering thoughts, and file the tinkering I do with code in a column of its own.',
      'about.p3': 'The blog is built with Hexo. The mosby theme is something I shaped piece by piece toward the minimal look I like, and it is deployed on GitHub Pages.',
      'about.p4': 'No hot takes, no rush — just a quiet place to write. Feel free to look around, and you can also find me on GitHub.'
    },
    ja: {
      'lang.zh': '中',
      'lang.en': 'EN',
      'lang.ja': '日',
      'nav.home': 'ホーム',
      'nav.diary': '日記',
      'nav.essay': '雑談',
      'nav.dev': '開発',
      'nav.archive': 'アーカイブ',
      'nav.tags': 'タグ',
      'nav.about': 'このサイトについて',
      'col.diary.name': '日記',
      'col.diary.desc': '日常の些細なことを綴る',
      'col.essay.name': '雑談',
      'col.essay.desc': 'とりとめのない考えと雑記',
      'col.dev.name': '開発',
      'col.dev.desc': 'コード・ツール・試行錯誤の記録',
      'tagline': '生活と学びの些事',
      'intro': 'ここは私の居場所です。日記を書いたり、ときどき雑談をしたり、開発の試行錯誤を記録したり。流行を追わず、急がず、ただ静かに書いています。',
      'stat.posts': '件の記事',
      'stat.tags': '個のタグ',
      'stat.categories': '個のカテゴリ',
      'footer': '© 2026 早坂直治 · Built with Hexo',
      'page.index': 'INDEX',
      'page.archives': 'アーカイブ',
      'page.categories': 'カテゴリ',
      'page.category': 'カテゴリ',
      'page.tags': 'タグ',
      'page.tag': 'タグ',
      'page.archive.title': 'アーカイブ',
      'page.categories.title': 'カテゴリ',
      'page.tags.title': 'タグ',
      'cat.count': '件',
      'cat.sub': '個のカテゴリ',
      'tag.sub': '個のタグ',
      'related.posts': '件の関連記事',
      'about.p1': 'こんにちは、早坂直治です。',
      'about.p2': 'ここは私の居場所です。日常の些細なことを日記に綴り、ときどきとりとめのない考えを雑談に書きます。コードまわりの試行錯誤は、独立したコーナーにまとめています。',
      'about.p3': 'ブログは Hexo で構築し、テーマの mosby は好きなミニマルな雰囲気に合わせて少しずつ作り上げました。GitHub Pages にデプロイしています。',
      'about.p4': '流行を追わず、急がず、ただ静かに書ける場所が欲しかっただけです。どうぞゆっくり見ていってください。GitHub でもお会いできます。'
    }
  };

  var STORAGE_KEY = 'mosby-lang';
  var DEFAULT_LANG = 'zh';
  var current = DEFAULT_LANG;

  function apply(lang) {
    var dict = I18N[lang] || I18N[DEFAULT_LANG];
    document.documentElement.lang = lang;
    // 1) 普通文本：data-i18n="key"
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    }
    // 2) 带属性的元素：data-i18n-attr="key|attr"（用于 menu、columns）
    var attrs = document.querySelectorAll('[data-i18n-attr]');
    for (var j = 0; j < attrs.length; j++) {
      var ael = attrs[j];
      var spec = ael.getAttribute('data-i18n-attr').split('|');
      var k2 = spec[0];
      var attr = spec[1] || 'data-label';
      if (dict[k2] != null) ael.setAttribute(attr, dict[k2]);
    }
    document.documentElement.setAttribute('data-lang', lang);
  }

  function renderSwitcher() {
    var btns = document.querySelectorAll('.lang-switcher button');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var lang = b.getAttribute('data-lang');
      if (lang === current) b.classList.add('active');
      else b.classList.remove('active');
    }
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && I18N[saved]) {
      current = saved;
    } else {
      var nav = (navigator.language || '').toLowerCase();
      if (nav.indexOf('ja') === 0) current = 'ja';
      else if (nav.indexOf('zh') === 0) current = 'zh';
      else current = 'en';
    }
    apply(current);
    renderSwitcher();
    // 绑定切换
    var btns = document.querySelectorAll('.lang-switcher button');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          var lang = b.getAttribute('data-lang');
          if (!lang || !I18N[lang]) return;
          current = lang;
          apply(lang);
          renderSwitcher();
          try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
        });
      })(btns[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

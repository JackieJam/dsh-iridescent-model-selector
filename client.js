window.__ModuleLoader__.load({
  id: 'dsh-iridescent-model-selector',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'iridescent-model-selector';
    const STORAGE_KEY = 'dsh.iridescent-model-selector.efforts.v1';
    const FAVORITES_KEY = 'dsh.iridescent-model-selector.favorites.v1';
    const PANEL_W = 312;
    const AURORA = [
      [0, [143, 227, 236]],
      [0.35, [111, 184, 255]],
      [0.62, [138, 141, 255]],
      [0.82, [196, 134, 242]],
      [1, [243, 155, 196]]
    ];
    const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const AURORA_CSS = `linear-gradient(90deg,${AURORA.map(([at, c]) => `${rgb(c)} ${Math.round(at * 100)}%`).join(',')})`;
    function auroraAt(p) {
      const x = Math.min(1, Math.max(0, Number(p) || 0));
      for (let i = 1; i < AURORA.length; i += 1) {
        const [p0, c0] = AURORA[i - 1];
        const [p1, c1] = AURORA[i];
        if (x <= p1) {
          const k = (x - p0) / (p1 - p0);
          return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
        }
      }
      return AURORA[AURORA.length - 1][1];
    }

    const strings = {
      zh: {
        'trigger.select': '选择模型',
        'trigger.loading': '正在加载模型…',
        'trigger.aria': '选择模型，当前 {model}',
        'heading': '选择模型',
        'search': '搜索',
        'loading': '正在加载模型…',
        'empty': '暂无可用模型',
        'noResults': '没有匹配的模型',
        'error': '模型操作失败：{message}',
        'writerHeld': '当前会话已被其他 DSH 实例占用，请关闭其他实例后重试。',
        'retry': '重试',
        'provider.account': 'DeepSeek 账号',
        'favorites': '收藏',
        'favorite.add': '收藏模型',
        'favorite.remove': '取消收藏',
        'effort': '思考程度',
        'effort.default': '默认',
        'effort.unavailable': '此模型不支持调整思考程度',
        'effort.stale': '已保存的档位「{effort}」不再提供，请选择新档位。',
        'selectFirst': '选择模型后可调整思考程度',
        'saving': '正在应用…',
        'selected': '当前模型',
        'failures': '{name} 加载失败：{message}。请重新连接后重试。'
      },
      en: {
        'trigger.select': 'Select model',
        'trigger.loading': 'Loading models…',
        'trigger.aria': 'Select model, current {model}',
        'heading': 'Choose a model',
        'search': 'Search',
        'loading': 'Loading models…',
        'empty': 'No models available',
        'noResults': 'No matching models',
        'error': 'Model operation failed: {message}',
        'writerHeld': 'This session is in use by another DSH instance. Close the other instance and retry.',
        'retry': 'Retry',
        'provider.account': 'DeepSeek Account',
        'favorites': 'Favorites',
        'favorite.add': 'Favorite model',
        'favorite.remove': 'Remove from favorites',
        'effort': 'Reasoning effort',
        'effort.default': 'Default',
        'effort.unavailable': 'This model does not support adjusting reasoning effort',
        'effort.stale': 'The saved effort “{effort}” is no longer available. Choose a new level.',
        'selectFirst': 'Select a model to adjust reasoning effort',
        'saving': 'Applying…',
        'selected': 'Current model',
        'failures': '{name} failed to load: {message}. Reconnect and retry.'
      }
    };

    const SPRING = 'cubic-bezier(.3,1.2,.6,1)';
    const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';
    const css = `
      .irm-root{position:relative;min-width:0}
      .irm-trigger{min-width:0;max-width:min(360px,45cqw);height:28px;display:flex;align-items:center;gap:6px;padding:0 8px 0 9px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;letter-spacing:-.005em;cursor:pointer;transition:background-color .15s ease-out,transform .12s ease-out}
      .irm-trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
      .irm-trigger:active:not(:disabled){transform:scale(.97)}
      .irm-trigger:disabled{opacity:.5;cursor:default}
      .irm-trigger:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px}
      .irm-spark{flex:none;width:13px;height:13px;display:block;transition:filter .4s ease-out}
      .irm-spark[data-vivid]{filter:drop-shadow(0 0 3px rgba(196,134,242,.6))}
      .irm-label,.irm-trigger-effort{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:var(--dsh-composer-model-text-display,block)}
      .irm-label{font-weight:500}
      .irm-trigger-effort{color:var(--dsw-alias-label-tertiary);flex-shrink:1000}
      .irm-chevron,.irm-spinner{flex:none;width:12px;height:12px;display:block;opacity:.5}
      .irm-chevron{transition:transform .24s ${EASE_OUT}}.irm-chevron[data-open]{transform:rotate(180deg)}
      .irm-spinner{opacity:.75;animation:irm-spin .8s linear infinite}
      @keyframes irm-spin{to{transform:rotate(360deg)}}

      .irm-panel{position:fixed;z-index:1200;box-sizing:border-box;width:min(${PANEL_W}px,calc(100vw - 24px));max-height:calc(100vh - 24px);display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;padding:6px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:14px;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));background:color-mix(in srgb,var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1)) 84%,transparent);backdrop-filter:blur(30px) saturate(1.9);-webkit-backdrop-filter:blur(30px) saturate(1.9);color:var(--dsw-alias-label-primary);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 26px 64px -12px rgba(4,10,26,.42),0 8px 22px -8px rgba(4,10,26,.24);font-size:13px;-webkit-font-smoothing:antialiased;transform-origin:var(--irm-origin,bottom right);animation:irm-enter .26s ${EASE_OUT}}
      .irm-panel[data-closing]{animation:irm-exit .16s cubic-bezier(.4,0,1,1) forwards}
      @keyframes irm-enter{from{opacity:0;transform:translateY(var(--irm-shift,6px)) scale(.96)}to{opacity:1;transform:none}}
      @keyframes irm-exit{to{opacity:0;transform:translateY(calc(var(--irm-shift,6px) * .6)) scale(.98)}}

      .irm-searchbox{position:relative;margin:2px 2px 4px}
      .irm-searchbox svg{position:absolute;left:10px;top:50%;width:13px;height:13px;margin-top:-6.5px;color:var(--dsw-alias-label-tertiary);pointer-events:none}
      .irm-search{box-sizing:border-box;width:100%;height:30px;padding:0 10px 0 30px;border:.5px solid transparent;border-radius:9px;background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-interactive-bg-hover));color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;outline:none;transition:border-color .15s ease-out,box-shadow .15s ease-out}
      .irm-search::-webkit-search-cancel-button{-webkit-appearance:none}
      .irm-search:focus{border-color:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));box-shadow:0 0 0 3px rgba(111,184,255,.2)}
      .irm-search::placeholder{color:var(--dsw-alias-label-tertiary)}

      .irm-list{min-height:0;max-height:min(248px,34vh);overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
      .irm-group{display:flex;align-items:center;gap:5px;padding:9px 10px 4px;font-size:11px;line-height:14px;font-weight:600;letter-spacing:.03em;color:var(--dsw-alias-label-tertiary)}
      .irm-group svg{width:10px;height:10px;display:block;color:#f5b83d}
      .irm-option-wrap{position:relative}
      .irm-option{width:100%;min-width:0;display:flex;align-items:center;gap:8px;min-height:32px;text-align:left;padding:6px 36px 6px 10px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;cursor:pointer;outline:none;transition:background-color .12s ease-out,color .12s ease-out}
      .irm-option:hover:not(:disabled),.irm-option:focus-visible{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
      .irm-option[data-selected=true]{color:var(--dsw-alias-label-primary);font-weight:500}
      .irm-option:disabled{opacity:.55;cursor:default}
      .irm-option-name{min-width:0;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .irm-qual{margin-left:6px;font-size:12px;font-weight:400;color:var(--dsw-alias-label-tertiary)}
      .irm-check{width:14px;height:14px;flex:none;display:block;color:rgb(111,184,255)}
      .irm-fav{position:absolute;right:4px;top:50%;width:26px;height:26px;margin-top:-13px;display:flex;align-items:center;justify-content:center;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:0;transition:opacity .15s ease-out,color .15s ease-out,background-color .15s ease-out}
      .irm-fav svg{width:13px;height:13px;display:block}
      .irm-option-wrap:hover .irm-fav,.irm-option-wrap:focus-within .irm-fav,.irm-option-wrap[data-favorited] .irm-fav{opacity:1}
      .irm-fav:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
      .irm-fav:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:-2px}
      .irm-option-wrap[data-favorited] .irm-fav{color:#f5b83d}
      .irm-option-wrap[data-pop] .irm-fav svg{animation:irm-pop .42s cubic-bezier(.3,1.6,.5,1)}
      @keyframes irm-pop{0%{transform:scale(.55)}55%{transform:scale(1.22)}100%{transform:scale(1)}}

      .irm-sep{height:.5px;flex:none;margin:6px 8px;background:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1))}
      .irm-effort{padding:4px 6px}
      .irm-slider{position:relative;height:28px}
      .irm-glow-wrap{position:absolute;left:9px;right:9px;top:50%;height:10px;margin-top:-5px;pointer-events:none}
      .irm-glow-wrap[data-vivid]{animation:irm-breathe 3.4s ease-in-out infinite}
      @keyframes irm-breathe{50%{opacity:.6}}
      .irm-glow{position:absolute;inset:0;border-radius:999px;background:${AURORA_CSS};filter:blur(9px);opacity:var(--irm-glow-o);transform:scaleX(var(--irm-p));transform-origin:left center;transition:transform .38s ${SPRING},opacity .38s ease-out;animation:irm-reveal-glow .8s ${EASE_OUT} .05s backwards}
      @keyframes irm-reveal-glow{from{transform:scaleX(0);opacity:0}}
      .irm-track{position:absolute;left:9px;right:9px;top:50%;height:6px;margin-top:-3px;overflow:hidden;border-radius:999px;background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-border-l2));box-shadow:inset 0 .5px 1px rgba(0,0,0,.18)}
      .irm-aurora{position:absolute;inset:0;overflow:hidden;border-radius:inherit;background:${AURORA_CSS};clip-path:inset(0 calc((1 - var(--irm-p)) * 100%) 0 0 round 999px);transition:clip-path .38s ${SPRING};animation:irm-reveal .8s ${EASE_OUT} .05s backwards}
      @keyframes irm-reveal{from{clip-path:inset(0 100% 0 0 round 999px)}}
      .irm-shine{position:absolute;top:0;bottom:0;left:0;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent);mix-blend-mode:screen;opacity:var(--irm-shine-o);animation:irm-shine var(--irm-shine-dur) cubic-bezier(.45,0,.55,1) 1s infinite}
      @keyframes irm-shine{0%{transform:translateX(-110%)}55%,100%{transform:translateX(360%)}}
      .irm-rail{position:absolute;left:9px;right:9px;top:50%;height:0;pointer-events:none;transform:translateX(calc(var(--irm-p) * 100%));transition:transform .38s ${SPRING};animation:irm-reveal-rail .8s ${EASE_OUT} .05s backwards}
      @keyframes irm-reveal-rail{from{transform:translateX(0)}}
      .irm-thumb{position:absolute;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#fff;box-shadow:0 0 0 .5px rgba(0,0,0,.14),0 1px 3px rgba(0,0,0,.22),0 3px 10px rgba(0,0,0,.14),0 0 var(--irm-glow-r) var(--irm-glow);transition:transform .2s cubic-bezier(.3,1.4,.6,1),box-shadow .38s ease-out}
      .irm-slider:hover:not([data-disabled]) .irm-thumb{transform:scale(1.08)}
      .irm-slider:active:not([data-disabled]) .irm-thumb{transform:scale(1.14)}
      .irm-slider:has(.irm-range:focus-visible) .irm-thumb{box-shadow:0 0 0 .5px rgba(0,0,0,.14),0 1px 3px rgba(0,0,0,.22),0 0 0 4px rgba(111,184,255,.45),0 0 var(--irm-glow-r) var(--irm-glow)}
      .irm-slider[data-disabled]{opacity:.55}
      .irm-range{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;-webkit-appearance:none;appearance:none;background:transparent}
      .irm-range:disabled{cursor:default}
      .irm-range::-webkit-slider-runnable-track{height:28px;background:transparent}
      .irm-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:28px}
      .irm-range::-moz-range-thumb{width:18px;height:28px;border:0}
      .irm-levels{position:relative;height:20px;margin:1px 9px 0}
      .irm-level{position:absolute;top:0;padding:3px 4px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;line-height:14px;white-space:nowrap;cursor:pointer;transition:color .2s ease-out}
      .irm-level:hover:not(:disabled){color:var(--dsw-alias-label-secondary)}
      .irm-level[data-active=true]{color:var(--dsw-alias-label-primary);font-weight:600}
      .irm-level:disabled{cursor:default}
      .irm-level:focus-visible,.irm-retry:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:1px}

      .irm-note,.irm-status,.irm-error{padding:6px 10px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.45}
      .irm-error{color:var(--dsw-alias-state-error-primary);overflow-wrap:anywhere}
      .irm-retry{margin-left:6px;border:0;background:transparent;color:inherit;font:inherit;text-decoration:underline;cursor:pointer}
      @media (prefers-reduced-motion:reduce){
        .irm-panel,.irm-panel[data-closing],.irm-aurora,.irm-glow,.irm-rail,.irm-shine,.irm-glow-wrap,.irm-option-wrap[data-pop] .irm-fav svg{animation:none}
        .irm-trigger,.irm-chevron,.irm-option,.irm-fav,.irm-aurora,.irm-glow,.irm-rail,.irm-thumb,.irm-level,.irm-search,.irm-spark{transition:none}
      }
    `;

    function storageRead() {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return parsed && parsed.version === 1 && parsed.values && typeof parsed.values === 'object' && !Array.isArray(parsed.values) ? parsed.values : {};
      } catch (_) { return {}; }
    }
    function selectionKey(selection) {
      return JSON.stringify([selection.provider, selection.model]);
    }
    function remember(selection, effort) {
      if (!selection) return;
      try {
        const values = storageRead();
        if (typeof effort === 'string' && effort) values[selectionKey(selection)] = effort;
        else delete values[selectionKey(selection)];
        const limited = Object.fromEntries(Object.entries(values).slice(-200));
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, values: limited }));
      } catch (_) { /* The current session remains usable without browser storage. */ }
    }
    function savedEffort(provider, model) {
      const value = storageRead()[selectionKey({ provider, model: model.id })];
      return typeof value === 'string' && model.reasoning?.efforts?.some((entry) => entry.id === value) ? value : undefined;
    }
    function readFavorites() {
      try {
        const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        return Array.isArray(parsed) && parsed.every((key) => typeof key === 'string') ? parsed.slice(0, 24) : [];
      } catch (_) { return []; }
    }
    function writeFavorites(keys) {
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(keys.slice(0, 24))); } catch (_) { /* 收藏仅在本次会话生效。 */ }
    }
    function sameModel(a, b) {
      return !!a && !!b && a.provider === b.provider && a.model === b.model;
    }
    function shownError(error, t) {
      if (!error) return '';
      if (error.code === 'session/writer-held') return t('writerHeld');
      const message = typeof error === 'string' ? error : [error.code, error.message].filter(Boolean).join(': ');
      return t('error', { message: message || String(error) });
    }
    function providerName(entry, t) {
      return entry.id === 'deepseek-account' ? t('provider.account') : entry.name;
    }
    function splitName(name) {
      const text = String(name ?? '');
      const at = text.lastIndexOf(' · ');
      return at > 0 ? [text.slice(0, at), text.slice(at + 3)] : [text, ''];
    }

    const STAR = 'M8 1.9l1.86 3.77 4.16.6-3.01 2.94.71 4.14L8 11.4l-3.72 1.95.71-4.14L1.98 6.27l4.16-.6L8 1.9z';
    const SPARK = 'M8 1C8.55 5.1 10.9 7.45 15 8C10.9 8.55 8.55 10.9 8 15C7.45 10.9 5.1 8.55 1 8C5.1 7.45 7.45 5.1 8 1Z';
    function sparkIcon(gid, from, to, vivid) {
      return h('svg', { className: 'irm-spark', viewBox: '0 0 16 16', 'aria-hidden': true, 'data-vivid': vivid ? '' : undefined },
        h('defs', null, h('linearGradient', { id: gid, x1: '2', y1: '14', x2: '14', y2: '2', gradientUnits: 'userSpaceOnUse' },
          h('stop', { offset: '0', stopColor: rgb(from) }),
          h('stop', { offset: '1', stopColor: rgb(to) }))),
        h('path', { d: SPARK, fill: `url(#${gid})` }));
    }
    function chevronIcon(open) {
      return h('svg', { className: 'irm-chevron', viewBox: '0 0 16 16', 'aria-hidden': true, 'data-open': open ? '' : undefined },
        h('path', { d: 'm4 6.5 4 4 4-4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    }
    function spinnerIcon() {
      return h('svg', { className: 'irm-spinner', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeDasharray: '26 12' }));
    }
    function checkIcon() {
      return h('svg', { className: 'irm-check', viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: 'M3.5 8.4 6.6 11.5 12.6 4.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    }
    function starIcon(filled) {
      return h('svg', { viewBox: '0 0 16 16', 'aria-hidden': true },
        h('path', { d: STAR, fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinejoin: 'round' }));
    }
    function searchIcon() {
      return h('svg', { viewBox: '0 0 16 16', 'aria-hidden': true },
        h('circle', { cx: 7, cy: 7, r: 4.6, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }),
        h('path', { d: 'm10.6 10.6 3.4 3.4', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }));
    }

    function ModelSelector({ locked, available, directory, load, select, t }) {
      const state = React.useSyncExternalStore((notify) => directory.subscribe(notify), () => directory.getSnapshot(), () => directory.getSnapshot());
      const [open, setOpen] = React.useState(false);
      const [closing, setClosing] = React.useState(false);
      const closeTimerRef = React.useRef(null);
      const [query, setQuery] = React.useState('');
      const [focusedKey, setFocusedKey] = React.useState(null);
      const [draftIndex, setDraftIndex] = React.useState(null);
      const [localError, setLocalError] = React.useState(null);
      const [position, setPosition] = React.useState(null);
      const [popKey, setPopKey] = React.useState(null);
      const popTimerRef = React.useRef(null);
      const rootRef = React.useRef(null);
      const panelRef = React.useRef(null);
      const triggerRef = React.useRef(null);
      const searchRef = React.useRef(null);
      const draggingRef = React.useRef(false);
      const lastActionRef = React.useRef({ kind: 'load' });
      const id = React.useId();
      const gid = `irm${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
      React.useEffect(() => { Promise.resolve(load()).catch(() => {}); }, []);
      React.useEffect(() => () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        if (popTimerRef.current) clearTimeout(popTimerRef.current);
      }, []);
      const pending = state.pending !== null;
      const groups = React.useMemo(() => [...state.groups].sort((a, b) => {
        const rank = (group) => group.id === state.current?.provider ? -1 : group.id === 'deepseek-account' ? 0 : group.id === 'deepseek-official' ? 1 : 2;
        return rank(a) - rank(b);
      }), [state.groups, state.current?.provider]);
      const group = groups.find((item) => item.id === state.current?.provider);
      const model = group?.models.find((item) => item.id === state.current?.model);
      const reasoning = model?.reasoning;
      const efforts = React.useMemo(() => {
        if (!reasoning || !Array.isArray(reasoning.efforts) || reasoning.efforts.length === 0) return [];
        const options = reasoning.efforts.map((effort) => ({ id: effort.id, name: effort.name, description: effort.description }));
        return reasoning.defaultEffort === undefined ? [{ id: undefined, name: t('effort.default') }, ...options] : options;
      }, [reasoning, t]);
      const n = efforts.length;
      const effective = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
      const matchingIndex = efforts.findIndex((effort) => effort.id === effective);
      const staleEffort = n > 0 && effective !== undefined && matchingIndex < 0;
      const selectedIndex = Math.max(0, matchingIndex);
      const activeIndex = Math.min(Math.max(0, draftIndex ?? selectedIndex), Math.max(0, n - 1));
      const currentEffort = matchingIndex >= 0 ? efforts[matchingIndex] : undefined;
      const activeEffort = staleEffort && draftIndex === null ? undefined : efforts[activeIndex];
      const modelCount = groups.reduce((sum, entry) => sum + entry.models.length, 0);
      const needle = query.trim().toLocaleLowerCase();
      const filtered = groups.map((entry) => ({
        ...entry,
        models: entry.models.filter((item) => !needle || `${item.name} ${item.id} ${entry.name}`.toLocaleLowerCase().includes(needle))
          .sort((a, b) => Number(b.id === state.current?.model && entry.id === state.current?.provider) - Number(a.id === state.current?.model && entry.id === state.current?.provider))
      })).filter((entry) => entry.models.length > 0);
      const [favoriteKeys, setFavoriteKeys] = React.useState(readFavorites);
      const favoriteSet = React.useMemo(() => new Set(favoriteKeys), [favoriteKeys]);
      const toggleFavorite = (providerId, modelId) => {
        const key = selectionKey({ provider: providerId, model: modelId });
        const adding = !favoriteSet.has(key);
        setFavoriteKeys((keys) => {
          const next = keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key];
          writeFavorites(next);
          return next;
        });
        if (popTimerRef.current) clearTimeout(popTimerRef.current);
        if (adding) {
          setPopKey(key);
          popTimerRef.current = setTimeout(() => setPopKey(null), 450);
        } else {
          setPopKey(null);
        }
      };
      const favoriteModels = filtered.flatMap((entry) => entry.models
        .filter((item) => favoriteSet.has(selectionKey({ provider: entry.id, model: item.id })))
        .map((item) => ({ ...item, _providerId: entry.id })));
      const displayGroups = favoriteModels.length ? [{ id: '__favorites__', name: t('favorites'), models: favoriteModels }, ...filtered] : filtered;
      const showHeaders = displayGroups.length > 1;
      const visibleKeys = displayGroups.flatMap((entry) => entry.models.map((item) => selectionKey({ provider: entry.id === '__favorites__' ? item._providerId : entry.id, model: item.id })));
      const selectedKey = state.current ? selectionKey(state.current) : null;
      const tabStopKey = visibleKeys.includes(focusedKey) ? focusedKey : visibleKeys.includes(selectedKey) ? selectedKey : visibleKeys[0];
      const modelLabel = model?.name ?? (state.status === 'loading' ? t('trigger.loading') : t('trigger.select'));
      const effortLabel = model ? currentEffort?.name ?? state.retainedEffort ?? (staleEffort ? effective : undefined) : undefined;
      const triggerLabel = effortLabel ? `${modelLabel} · ${effortLabel}` : modelLabel;
      const triggerEffort = model
        ? (currentEffort ? (currentEffort.id === undefined ? undefined : currentEffort.name) : (state.retainedEffort ?? (staleEffort ? effective : undefined)))
        : undefined;
      const committedP = n > 1 && matchingIndex >= 0 ? matchingIndex / (n - 1) : 0;

      React.useEffect(() => { setDraftIndex(null); }, [state.current?.provider, state.current?.model, state.current?.reasoningEffort]);
      React.useEffect(() => { if (locked) { setOpen(false); setDraftIndex(null); } }, [locked]);
      React.useEffect(() => {
        if (!open) return undefined;
        const onOutside = (event) => {
          if (!rootRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) closePanel();
        };
        document.addEventListener('pointerdown', onOutside);
        return () => document.removeEventListener('pointerdown', onOutside);
      }, [open]);
      React.useLayoutEffect(() => {
        if (!open) { setPosition(null); return undefined; }
        const place = () => {
          const rect = triggerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const width = Math.min(PANEL_W, window.innerWidth - 24);
          const left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12));
          const roomAbove = rect.top - 20;
          const roomBelow = window.innerHeight - rect.bottom - 20;
          if (roomAbove < 200 && roomBelow > roomAbove) {
            setPosition({ left, top: rect.bottom + 8, maxHeight: Math.max(40, roomBelow), '--irm-origin': 'top right', '--irm-shift': '-6px' });
          } else {
            const bottom = Math.max(12, window.innerHeight - rect.top + 8);
            setPosition({ left, bottom, maxHeight: Math.max(40, roomAbove), '--irm-origin': 'bottom right', '--irm-shift': '6px' });
          }
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
      }, [open]);
      React.useEffect(() => {
        if (!open) return;
        const handle = requestAnimationFrame(() => {
          if (modelCount > 4) searchRef.current?.focus();
          else panelRef.current?.querySelector('[role="menuitemradio"][aria-checked="true"], [role="menuitemradio"]')?.focus();
        });
        return () => cancelAnimationFrame(handle);
      }, [open, modelCount > 4]);

      if (!available) return null;
      const openPanel = () => {
        setQuery(''); setFocusedKey(null); setDraftIndex(null); setLocalError(null); setOpen(true);
        lastActionRef.current = { kind: 'load' };
        Promise.resolve(load()).catch(setLocalError);
      };
      const closePanel = () => {
        if (!open) return;
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        setClosing(true);
        setDraftIndex(null);
        closeTimerRef.current = setTimeout(() => { setClosing(false); setOpen(false); }, 150);
        requestAnimationFrame(() => triggerRef.current?.focus());
      };
      const runSelect = async (selection, effortToRemember) => {
        if (locked || pending) return;
        lastActionRef.current = { kind: 'select', selection, effortToRemember };
        setLocalError(null);
        try {
          const result = await select(selection);
          if (!result) return;
          if (!result.ok) { setLocalError(result.error); setDraftIndex(null); return; }
          remember(selection, effortToRemember);
          setDraftIndex(null);
        } catch (error) { setLocalError(error); setDraftIndex(null); }
      };
      const chooseModel = (provider, nextModel) => {
        const selection = { provider, model: nextModel.id };
        if (locked || pending || sameModel(state.current, selection)) return;
        if (state.current) remember(state.current, effective);
        const effort = savedEffort(provider, nextModel) ?? nextModel.reasoning?.defaultEffort;
        if (effort !== undefined) selection.reasoningEffort = effort;
        runSelect(selection, effort);
      };
      const chooseEffort = (index) => {
        const choice = efforts[index];
        if (!choice || !state.current || locked || pending || choice.id === effective) { setDraftIndex(null); return; }
        const selection = { provider: state.current.provider, model: state.current.model };
        if (choice.id !== undefined) selection.reasoningEffort = choice.id;
        runSelect(selection, choice.id);
      };
      const onKeyDown = (event) => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); closePanel(); return; }
        const rows = [...(panelRef.current?.querySelectorAll('[role="menuitemradio"]:not(:disabled)') ?? [])];
        if (event.target === searchRef.current && event.key === 'Enter' && rows.length) {
          event.preventDefault(); rows[0].click(); return;
        }
        if (event.target === searchRef.current && event.key === 'ArrowDown' && rows.length) {
          event.preventDefault(); rows[0].focus(); return;
        }
        const index = rows.indexOf(event.target);
        if (index >= 0 && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
          event.preventDefault();
          const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length;
          rows[next]?.focus();
        }
      };

      const p = n > 1 ? activeIndex / (n - 1) : 1;
      const glowColor = auroraAt(p);
      const effortStyle = {
        '--irm-p': p.toFixed(4),
        '--irm-glow': rgba(glowColor, (0.32 + 0.4 * p).toFixed(2)),
        '--irm-glow-r': `${Math.round(8 + 12 * p)}px`,
        '--irm-glow-o': (0.12 + 0.55 * p).toFixed(2),
        '--irm-shine-o': (0.8 * p).toFixed(2),
        '--irm-shine-dur': `${(4.6 - 2 * p).toFixed(2)}s`
      };
      const sliderDisabled = locked || pending || n < 2;
      const error = localError || (state.status === 'error' ? state.error : null);

      const children = [
        h('style', { key: 'style' }, css),
        h('button', {
          key: 'trigger', ref: triggerRef, type: 'button', className: 'irm-trigger', disabled: locked,
          'aria-label': t('trigger.aria', { model: triggerLabel }), 'aria-haspopup': 'dialog', 'aria-expanded': open,
          'aria-controls': open ? `${id}-panel` : undefined, 'aria-busy': pending,
          title: triggerLabel, onClick: () => open ? closePanel() : openPanel()
        },
        sparkIcon(gid, auroraAt(0), auroraAt(Math.max(committedP, 0.4)), committedP >= 0.6),
        h('span', { className: 'irm-label' }, model ? splitName(model.name)[0] : modelLabel),
        triggerEffort ? h('span', { className: 'irm-trigger-effort' }, triggerEffort) : null,
        pending ? spinnerIcon() : chevronIcon(open))
      ];

      if (open) children.push(h('div', {
        key: 'panel', ref: panelRef, id: `${id}-panel`, className: 'irm-panel', 'data-closing': closing ? '' : undefined, role: 'dialog',
        'aria-label': t('heading'), 'aria-busy': state.status === 'loading' || pending,
        style: position || { visibility: 'hidden', left: 12, bottom: 12 }, onKeyDown
      },
      modelCount > 4 ? h('div', { className: 'irm-searchbox' }, searchIcon(), h('input', {
        ref: searchRef, className: 'irm-search', type: 'search', placeholder: t('search'), 'aria-label': t('search'),
        value: query, onChange: (event) => setQuery(event.target.value)
      })) : null,
      error ? h('div', { className: 'irm-error', role: 'alert' }, shownError(error, t),
        h('button', { type: 'button', className: 'irm-retry', onClick: () => {
          setLocalError(null);
          const action = lastActionRef.current;
          if (action.kind === 'select') runSelect(action.selection, action.effortToRemember);
          else Promise.resolve(load()).catch(setLocalError);
        } }, t('retry'))) : null,
      state.failures.map((failure) => h('div', { key: `failure-${failure.id}`, className: 'irm-error' }, t('failures', { name: failure.name, message: failure.message }))),
      h('div', { className: 'irm-list', role: 'menu', 'aria-label': t('heading') },
        state.status === 'loading' && !modelCount ? h('div', { className: 'irm-status', role: 'status' }, t('loading')) : null,
        ...displayGroups.map((entry) => h(React.Fragment, { key: entry.id },
          showHeaders ? h('div', { className: 'irm-group' }, entry.id === '__favorites__' ? starIcon(true) : null, providerName(entry, t)) : null,
          ...entry.models.map((item) => {
            const providerId = entry.id === '__favorites__' ? item._providerId : entry.id;
            const rowKey = selectionKey({ provider: providerId, model: item.id });
            const selected = state.current?.provider === providerId && state.current?.model === item.id;
            const favorited = favoriteSet.has(rowKey);
            const [primary, qualifier] = splitName(item.name);
            return h('div', {
              key: `${providerId}:${item.id}`, className: 'irm-option-wrap',
              'data-favorited': favorited ? '' : undefined, 'data-pop': popKey === rowKey ? '' : undefined
            },
              h('button', {
                type: 'button', role: 'menuitemradio', 'aria-checked': selected,
                tabIndex: rowKey === tabStopKey ? 0 : -1,
                onFocus: () => setFocusedKey(rowKey),
                'data-selected': selected, className: 'irm-option', disabled: locked || pending,
                title: `${item.name} · ${providerName(entry, t)}`, onClick: () => chooseModel(providerId, item)
              },
                h('span', { className: 'irm-option-name', 'data-provider-id': providerId, 'data-model-id': item.id },
                  primary, qualifier ? h('span', { className: 'irm-qual' }, qualifier) : null),
                selected ? checkIcon() : null),
              h('button', {
                type: 'button', className: 'irm-fav', tabIndex: -1, 'aria-pressed': favorited,
                'aria-label': favorited ? t('favorite.remove') : t('favorite.add'),
                title: favorited ? t('favorite.remove') : t('favorite.add'), disabled: locked || pending,
                onClick: (event) => { event.stopPropagation(); toggleFavorite(providerId, item.id); }
              }, starIcon(favorited)));
          }))),
        !filtered.length && state.status !== 'loading' ? h('div', { className: 'irm-status', role: 'status' }, modelCount ? t('noResults') : t('empty')) : null),
      h('div', { className: 'irm-sep' }),
      staleEffort ? h('div', { className: 'irm-note', role: 'status' }, t('effort.stale', { effort: effective })) : null,
      n ? h('div', { className: 'irm-effort', style: effortStyle },
        staleEffort ? null : h('div', { className: 'irm-slider', 'data-disabled': sliderDisabled ? '' : undefined },
          h('div', { className: 'irm-glow-wrap', 'data-vivid': p >= 0.6 ? '' : undefined, 'aria-hidden': true }, h('div', { className: 'irm-glow' })),
          h('div', { className: 'irm-track', 'aria-hidden': true }, h('div', { className: 'irm-aurora' }, h('div', { className: 'irm-shine' }))),
          h('div', { className: 'irm-rail', 'aria-hidden': true }, h('div', { className: 'irm-thumb' })),
          h('input', {
            className: 'irm-range', type: 'range', min: 0, max: Math.max(0, n - 1), step: 1,
            value: activeIndex, disabled: sliderDisabled, 'aria-label': t('effort'),
            'aria-valuetext': activeEffort?.name,
            onPointerDown: (event) => {
              draggingRef.current = true;
              event.currentTarget.setPointerCapture?.(event.pointerId);
            },
            onPointerUp: (event) => { draggingRef.current = false; chooseEffort(Number(event.currentTarget.value)); },
            onPointerCancel: () => { draggingRef.current = false; setDraftIndex(null); },
            onChange: (event) => {
              const next = Number(event.currentTarget.value);
              setDraftIndex(next);
              if (!draggingRef.current) chooseEffort(next);
            }
          })),
        h('div', { className: 'irm-levels' }, ...efforts.map((level, index) => {
          const at = n > 1 ? (index / (n - 1)) * 100 : 50;
          const shift = n > 1 && index === 0 ? 'translateX(-4px)' : n > 1 && index === n - 1 ? 'translateX(calc(-100% + 4px))' : 'translateX(-50%)';
          return h('button', {
            key: level.id ?? '__default__', type: 'button', className: 'irm-level',
            'data-active': !staleEffort && index === activeIndex, style: { left: `${at}%`, transform: shift },
            title: level.description || level.name, disabled: locked || pending, onClick: () => chooseEffort(index)
          }, level.name);
        }))) : h('div', { className: 'irm-note' }, model ? t('effort.unavailable') : t('selectFirst'))
      ));

      return h('div', {
        ref: rootRef,
        className: 'irm-root',
        onKeyDown,
        onBlur: (event) => {
          if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return;
          closePanel();
        }
      }, ...children);
    }

    return {
      inject: ['commandUi', 'locale', 'modelDirectories', 'remote', 'remote.session', 'sessions', 'slots'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'zh', strings.zh), 'iridescent-selector: Chinese');
        ctx.effect(() => ctx.locale.register(NS, 'en', strings.en), 'iridescent-selector: English');
        ctx.inject(['slots', 'sessions', 'modelDirectories'], (scope) => {
          const models = scope.modelDirectories;
          const sessions = scope.sessions;
          if (typeof models?.directoryFor !== 'function' || typeof sessions?.subagentAddress !== 'function') return;
          scope.slots.inject('conversation.input.model', () => scope.slots.register({
            name: 'conversation.input.model',
            priority: -100,
            locale: NS,
            inject: (sessionId) => {
              const item = models.directoryFor(sessionId);
              if (!item?.store || typeof item.store.subscribe !== 'function' || typeof item.store.getSnapshot !== 'function' || typeof item.load !== 'function' || typeof item.select !== 'function') {
                throw new Error('Model directory contract changed; the native selector should remain available.');
              }
              const available = sessions.subagentAddress(sessionId) === undefined;
              return {
                available,
                directory: item.store,
                load: () => available ? item.load() : Promise.resolve(),
                select: async (selection) => {
                  if (!available) return undefined;
                  let operationGeneration;
                  try {
                    const operation = item.select(selection);
                    operationGeneration = item.generation;
                    return await operation;
                  } catch (error) {
                    const outstanding = item.store.getSnapshot().pending;
                    if (typeof operationGeneration === 'number' && item.generation === operationGeneration && sameModel(outstanding, selection) && outstanding?.reasoningEffort === selection.reasoningEffort && typeof item.resetConnected === 'function') {
                      item.resetConnected();
                    }
                    throw error;
                  }
                }
              };
            }
          }, ModelSelector));
        });
      }
    };
  }
});

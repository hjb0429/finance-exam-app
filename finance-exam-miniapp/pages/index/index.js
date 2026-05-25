const DATA = require("../../utils/data.js");
const OPT = ["A", "B", "C", "D", "E", "F", "G", "H"];
const TP = {
  single_choice: "单选",
  multi_choice: "多选题",
  true_false: "判断",
  calculation: "计算题",
};

function normAnswer(raw, type) {
  const t = raw.trim();
  if (type === "true_false") {
    if (/^(true|正确|对|是|a)$/i.test(t)) return "A";
    if (/^(false|错误|错|否|b)$/i.test(t)) return "B";
    return t.toUpperCase();
  }
  if (type === "multi_choice") {
    const m = t.match(/[A-Za-z]/g);
    if (!m) return t.toUpperCase();
    return [...new Set(m.map((l) => l.toUpperCase()))].sort().join("");
  }
  return t.toUpperCase().charAt(0);
}

function checkAns(user, correct, type) {
  let u = user.trim();
  if (type === "multi_choice")
    u = (u.match(/[A-Za-z]/g) || []).map((l) => l.toUpperCase()).sort().join("");
  else u = u.toUpperCase().charAt(0);
  return u === normAnswer(correct, type);
}

Page({
  data: {
    tab: "home",
    chapters: DATA.chapters.sort((a, b) => a.order - b.order),
    guide: DATA.guides.guide || null,
    changes: DATA.guides.changes || null,
    chapterOpen: {},
    sectionOpen: {},
    quizMode: null,
    quizChapter: null,
    quizQuestions: [],
    quizIdx: 0,
    quizResults: [],
    quizSelected: [],
    quizSubmitted: false,
    quizCorrect: false,
    quizFinished: false,
    searchQuery: "",
    searchKps: [],
    searchQs: [],
    totalKp: DATA.knowledgePoints.length,
    masteredKp: 0,
    weakKp: 0,
    stats: { totalAttempts: 0, correctRate: 0, weakPoints: 0 },
    sectionsByChapter: {},
    kpsBySection: {},
    kpsByChapter: {},
    optLabels: OPT,
    currentQuestion: {},
    qTypeLabel: "",
    correctAnswer: "",
    displayOptions: [],
    correctCount: 0,
    quizRate: 0,
  },

  onLoad() {
    this.buildLookups();
    this.refreshStats();
  },

  onShow() {
    this.refreshStats();
  },

  buildLookups() {
    const sbc = {};
    const kbs = {};
    for (const s of DATA.sections) {
      if (!sbc[s.chapterId]) sbc[s.chapterId] = [];
      sbc[s.chapterId].push(s);
    }
    for (const k of DATA.knowledgePoints) {
      if (!kbs[k.sectionId]) kbs[k.sectionId] = [];
      kbs[k.sectionId].push(k);
    }
    const kpbc = {};
    for (const ch of DATA.chapters) {
      kpbc[ch.id] = [];
      const secs = (sbc[ch.id] || []).sort((a, b) => a.order - b.order);
      for (const sec of secs) {
        kpbc[ch.id].push(...(kbs[sec.id] || []));
      }
    }
    this.setData({
      sectionsByChapter: sbc,
      kpsBySection: kbs,
      kpsByChapter: kpbc,
    });
  },

  refreshStats() {
    const h = wx.getStorageSync("fe_history") || [];
    if (h.length === 0) {
      const mastered = DATA.knowledgePoints.filter(
        (k) => k.masteryLevel === "mastered"
      ).length;
      const weak = DATA.knowledgePoints.filter(
        (k) => k.masteryLevel === "weak"
      ).length;
      this.setData({
        stats: { totalAttempts: 0, correctRate: 0, weakPoints: weak },
        masteredKp: mastered,
        weakKp: weak,
      });
      return;
    }
    const correct = h.filter((a) => a.ok).length;
    const mastered = DATA.knowledgePoints.filter(
      (k) => k.masteryLevel === "mastered"
    ).length;
    const weak = DATA.knowledgePoints.filter(
      (k) => k.masteryLevel === "weak"
    ).length;
    this.setData({
      stats: {
        totalAttempts: h.length,
        correctRate: Math.round((correct / h.length) * 100),
        weakPoints: weak,
      },
      masteredKp: mastered,
      weakKp: weak,
    });
  },

  switchTab(e) {
    const t = e.currentTarget.dataset.tab;
    this.setData({ tab: t });
    if (t === "analysis" || t === "home") this.refreshStats();
  },

  toggleChapter(e) {
    const id = e.currentTarget.dataset.id;
    const co = { ...this.data.chapterOpen };
    co[id] = !co[id];
    this.setData({ chapterOpen: co });
  },

  toggleSection(e) {
    const id = e.currentTarget.dataset.id;
    const so = { ...this.data.sectionOpen };
    so[id] = !so[id];
    this.setData({ sectionOpen: so });
  },

  // Quiz
  startQuiz(e) {
    const mode = e.currentTarget.dataset.mode;
    const chId = e.currentTarget.dataset.id;
    let pool = [];

    if (mode === "chapter" && chId) {
      const secIds = (this._sbc[chId] || []).map((s) => s.id);
      const kpIds = DATA.knowledgePoints
        .filter((k) => secIds.includes(k.sectionId))
        .map((k) => k.id);
      pool = DATA.questions.filter((q) => kpIds.includes(q.knowledgePointId));
    } else if (mode === "weak") {
      const weakIds = DATA.knowledgePoints
        .filter((k) => k.masteryLevel === "weak")
        .map((k) => k.id);
      pool = DATA.questions.filter((q) => weakIds.includes(q.knowledgePointId));
      if (pool.length === 0) pool = DATA.questions;
    } else {
      pool = [...DATA.questions];
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const questions = pool.slice(0, 30);
    this.setData({
      quizMode: mode,
      quizChapter: chId,
      quizQuestions: questions,
      quizIdx: 0,
      quizResults: [],
      quizSelected: [],
      quizSubmitted: false,
      quizCorrect: false,
      quizFinished: false,
      currentQuestion: questions[0] || {},
      qTypeLabel: questions[0] ? (TP[questions[0].type] || questions[0].type) : "",
      correctAnswer: questions[0] ? normAnswer(questions[0].answer, questions[0].type) : "",
      displayOptions: questions[0] ? (questions[0].options && questions[0].options.length > 0 ? questions[0].options : ["A. 正确", "B. 错误"]) : [],
      correctCount: 0,
      quizRate: 0,
    });
  },

  quitQuiz() {
    this.setData({
      quizMode: null,
      quizFinished: false,
      quizSubmitted: false,
      quizSelected: [],
      currentQuestion: {},
      quizQuestions: [],
      quizResults: [],
      quizIdx: 0,
    });
  },

  selectOption(e) {
    if (this.data.quizSubmitted) return;
    const label = e.currentTarget.dataset.label;
    const q = this.data.quizQuestions[this.data.quizIdx];
    let sel = [...this.data.quizSelected];
    if (q.type === "multi_choice") {
      sel = sel.includes(label) ? sel.filter((l) => l !== label) : [...sel, label];
    } else {
      sel = [label];
    }
    this.setData({ quizSelected: sel });
  },

  submitAnswer() {
    if (this.data.quizSelected.length === 0) return;
    const q = this.data.quizQuestions[this.data.quizIdx];
    const isMulti = q.type === "multi_choice";
    const ua = isMulti ? this.data.quizSelected.sort().join(",") : this.data.quizSelected[0];
    const ok = checkAns(ua, q.answer, q.type);
    const results = [...this.data.quizResults, { qid: q.id, ok }];

    // Save to wx storage
    const h = wx.getStorageSync("fe_history") || [];
    h.push({ qid: q.id, ans: ua, ok, ts: new Date().toISOString() });
    if (h.length > 1000) h.splice(0, h.length - 1000);
    wx.setStorageSync("fe_history", h);

    this.setData({
      quizSubmitted: true,
      quizCorrect: ok,
      quizResults: results,
      correctCount: results.filter((r) => r.ok).length,
      quizRate: Math.round((results.filter((r) => r.ok).length / results.length) * 100),
    });
  },

  prevQuestion() {
    if (this.data.quizIdx > 0) {
      const idx = this.data.quizIdx - 1;
      const q = this.data.quizQuestions[idx];
      const prev = this.data.quizResults[idx];
      this.setData({
        quizIdx: idx,
        quizSubmitted: true,
        quizCorrect: prev ? prev.ok : false,
        quizSelected: [],
        currentQuestion: q,
        qTypeLabel: q ? (TP[q.type] || q.type) : "",
        correctAnswer: q ? normAnswer(q.answer, q.type) : "",
        displayOptions: q ? (q.options && q.options.length > 0 ? q.options : ["A. 正确", "B. 错误"]) : [],
      });
    }
  },

  nextQuestion() {
    if (this.data.quizIdx < this.data.quizQuestions.length - 1) {
      const idx = this.data.quizIdx + 1;
      const q = this.data.quizQuestions[idx];
      this.setData({
        quizIdx: idx,
        quizSubmitted: false,
        quizCorrect: false,
        quizSelected: [],
        currentQuestion: q,
        qTypeLabel: q ? (TP[q.type] || q.type) : "",
        correctAnswer: q ? normAnswer(q.answer, q.type) : "",
        displayOptions: q ? (q.options && q.options.length > 0 ? q.options : ["A. 正确", "B. 错误"]) : [],
      });
    } else if (this.data.quizSubmitted) {
      this.setData({ quizFinished: true });
    }
  },

  retryQuiz() {
    this.setData({ quizFinished: false, quizMode: null });
    const mode = this.data.quizMode;
    const chId = this.data.quizChapter;
    this.startQuiz({ currentTarget: { dataset: { mode, id: chId } } });
  },

  // Search
  doSearch(e) {
    const q = e.detail.value;
    this.setData({ searchQuery: q });
    if (!q.trim()) {
      this.setData({ searchKps: [], searchQs: [] });
      return;
    }
    const lower = q.toLowerCase();
    const kps = DATA.knowledgePoints
      .filter((k) => k.title.toLowerCase().includes(lower) || k.content.toLowerCase().includes(lower))
      .slice(0, 20);
    const qs = DATA.questions
      .filter((q) => q.stem.toLowerCase().includes(lower) || (q.analysis || "").toLowerCase().includes(lower))
      .slice(0, 20);
    this.setData({ searchKps: kps, searchQs: qs });
  },

});

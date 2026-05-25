const DATA = require("../../utils/data.js");

function normAnswer(raw, type) {
  const t = (raw || "").trim();
  if (type === "true_false") {
    if (/^(true|正确|对|是|a|A)$/.test(t)) return "A";
    if (/^(false|错误|错|否|b|B)$/.test(t)) return "B";
    return t.toUpperCase();
  }
  if (type === "multi_choice") {
    const m = t.match(/[A-Za-z]/g);
    if (!m) return t.toUpperCase();
    return [...new Set(m.map(function(l) { return l.toUpperCase(); }))].sort().join("");
  }
  return t.toUpperCase().charAt(0);
}

function checkAns(user, correct, type) {
  var u = (user || "").trim();
  if (type === "multi_choice") {
    var m = u.match(/[A-Za-z]/g) || [];
    u = m.map(function(l) { return l.toUpperCase(); }).sort().join("");
  } else {
    u = u.toUpperCase().charAt(0);
  }
  return u === normAnswer(correct, type);
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

var OPT = ["A", "B", "C", "D", "E", "F", "G", "H"];
var TP = { single_choice: "单选", multi_choice: "多选题", true_false: "判断", calculation: "计算题" };

Page({
  data: {
    tab: "home",
    chapters: DATA.chapters.sort(function(a, b) { return a.order - b.order; }),
    guide: DATA.guides.guide || null,
    changes: DATA.guides.changes || null,
    chapterOpen: {},
    sectionOpen: {},
    quizMode: null,
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
    // Quiz display
    currentQuestion: {},
    qTypeLabel: "",
    correctAnswerDisplay: "",
    displayOptions: [],
    correctCount: 0,
    quizRate: 0,
    quizProgress: 0,
    // Option states (pre-computed)
    optionsState: [],
    resultMsg: "",
    resultClass: "",
    // Chapter progress for analysis
    chapterProgress: [],
    masteryPercent: 0,
    // Framework chapter list
    frameworkChapters: [],
  },

  onLoad: function() {
    this.buildLookups();
    this.refreshStats();
  },

  onShow: function() {
    this.refreshStats();
  },

  buildLookups: function() {
    var sbc = {};
    var kbs = {};
    for (var i = 0; i < DATA.sections.length; i++) {
      var s = DATA.sections[i];
      if (!sbc[s.chapterId]) sbc[s.chapterId] = [];
      sbc[s.chapterId].push(s);
    }
    for (var j = 0; j < DATA.knowledgePoints.length; j++) {
      var k = DATA.knowledgePoints[j];
      if (!kbs[k.sectionId]) kbs[k.sectionId] = [];
      kbs[k.sectionId].push(k);
    }
    var kpbc = {};
    for (var ci = 0; ci < DATA.chapters.length; ci++) {
      var ch = DATA.chapters[ci];
      kpbc[ch.id] = [];
      var secs = (sbc[ch.id] || []).sort(function(a, b) { return a.order - b.order; });
      for (var si = 0; si < secs.length; si++) {
        var secKps = kbs[secs[si].id] || [];
        for (var ki = 0; ki < secKps.length; ki++) {
          kpbc[ch.id].push(secKps[ki]);
        }
      }
    }
    this.setData({
      sectionsByChapter: sbc,
      kpsBySection: kbs,
      kpsByChapter: kpbc,
    });
  },

  refreshStats: function() {
    var h = wx.getStorageSync("fe_history") || [];
    var mastered = 0;
    var weak = 0;
    for (var i = 0; i < DATA.knowledgePoints.length; i++) {
      var k = DATA.knowledgePoints[i];
      if (k.masteryLevel === "mastered") mastered++;
      if (k.masteryLevel === "weak") weak++;
    }
    var totalKp = DATA.knowledgePoints.length;
    var masteryPercent = totalKp > 0 ? Math.round(mastered / totalKp * 100) : 0;

    if (h.length === 0) {
      this.setData({
        stats: { totalAttempts: 0, correctRate: 0, weakPoints: weak },
        masteredKp: mastered, weakKp: weak, masteryPercent: masteryPercent,
      });
      return;
    }
    var correct = 0;
    for (var j = 0; j < h.length; j++) { if (h[j].ok) correct++; }
    this.setData({
      stats: {
        totalAttempts: h.length,
        correctRate: Math.round(correct / h.length * 100),
        weakPoints: weak,
      },
      masteredKp: mastered, weakKp: weak, masteryPercent: masteryPercent,
    });
    this.buildChapterProgress();
  },

  buildChapterProgress: function() {
    var cp = [];
    var chapters = this.data.chapters;
    for (var i = 0; i < chapters.length; i++) {
      var ch = chapters[i];
      var kps = this.data.kpsByChapter[ch.id] || [];
      var mastered = 0;
      for (var j = 0; j < kps.length; j++) {
        if (kps[j].masteryLevel === "mastered") mastered++;
      }
      cp.push({
        title: ch.title,
        mastered: mastered,
        total: kps.length,
        percent: kps.length > 0 ? Math.round(mastered / kps.length * 100) : 0,
      });
    }
    this.setData({ chapterProgress: cp });
  },

  switchTab: function(e) {
    var t = e.currentTarget.dataset.tab;
    this.setData({ tab: t });
    if (t === "analysis" || t === "home") {
      this.refreshStats();
      this.buildChapterProgress();
    }
  },

  toggleChapter: function(e) {
    var id = e.currentTarget.dataset.id;
    var co = this.data.chapterOpen;
    co[id] = !co[id];
    this.setData({ chapterOpen: co });
  },

  toggleSection: function(e) {
    var id = e.currentTarget.dataset.id;
    var so = this.data.sectionOpen;
    so[id] = !so[id];
    this.setData({ sectionOpen: so });
  },

  // Quiz
  startQuiz: function(e) {
    var mode = e.currentTarget.dataset.mode;
    var chId = e.currentTarget.dataset.id;
    var pool = [];

    if (mode === "chapter" && chId) {
      var sbc = this.data.sectionsByChapter;
      var secIds = (sbc[chId] || []).map(function(s) { return s.id; });
      var kpIds = [];
      for (var i = 0; i < DATA.knowledgePoints.length; i++) {
        if (secIds.indexOf(DATA.knowledgePoints[i].sectionId) > -1) kpIds.push(DATA.knowledgePoints[i].id);
      }
      for (var j = 0; j < DATA.questions.length; j++) {
        if (kpIds.indexOf(DATA.questions[j].knowledgePointId) > -1) pool.push(DATA.questions[j]);
      }
    } else if (mode === "weak") {
      var weakIds = [];
      for (var k = 0; k < DATA.knowledgePoints.length; k++) {
        if (DATA.knowledgePoints[k].masteryLevel === "weak") weakIds.push(DATA.knowledgePoints[k].id);
      }
      for (var l = 0; l < DATA.questions.length; l++) {
        if (weakIds.indexOf(DATA.questions[l].knowledgePointId) > -1) pool.push(DATA.questions[l]);
      }
      if (pool.length === 0) pool = DATA.questions.slice();
    } else {
      pool = DATA.questions.slice();
    }

    pool = shuffle(pool);
    var questions = pool.slice(0, 30);
    var q = questions[0] || {};

    this.setData({
      quizMode: mode,
      quizQuestions: questions,
      quizIdx: 0,
      quizResults: [],
      quizSelected: [],
      quizSubmitted: false,
      quizCorrect: false,
      quizFinished: false,
      currentQuestion: q,
      qTypeLabel: TP[q.type] || q.type || "",
      correctAnswerDisplay: normAnswer(q.answer || "", q.type || ""),
      displayOptions: (q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"],
      correctCount: 0,
      quizRate: 0,
      quizProgress: 0,
      optionsState: [],
      resultMsg: "",
      resultClass: "",
    });
  },

  quitQuiz: function() {
    this.setData({
      quizMode: null, quizFinished: false, quizSubmitted: false, quizSelected: [],
      quizQuestions: [], quizResults: [], quizIdx: 0,
    });
  },

  selectOption: function(e) {
    if (this.data.quizSubmitted) return;
    var label = e.currentTarget.dataset.label;
    var q = this.data.quizQuestions[this.data.quizIdx];
    var sel = this.data.quizSelected.slice();
    if (q.type === "multi_choice") {
      var idx = sel.indexOf(label);
      if (idx > -1) sel.splice(idx, 1); else sel.push(label);
    } else {
      sel = [label];
    }
    // Compute option states
    var states = this.computeOptionStates(q, sel, false, "");
    this.setData({ quizSelected: sel, optionsState: states });
  },

  computeOptionStates: function(q, selected, submitted, correctAnswer) {
    var opts = (q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"];
    var states = [];
    for (var i = 0; i < opts.length; i++) {
      var label = OPT[i];
      var state = "";
      if (submitted) {
        if (correctAnswer.indexOf(label) > -1) state = "correct";
        else if (selected.indexOf(label) > -1) state = "wrong";
      } else {
        if (selected.indexOf(label) > -1) state = "selected";
      }
      states.push(state);
    }
    return states;
  },

  submitAnswer: function() {
    if (this.data.quizSelected.length === 0) return;
    var q = this.data.quizQuestions[this.data.quizIdx];
    var isMulti = q.type === "multi_choice";
    var ua = isMulti ? this.data.quizSelected.sort().join(",") : this.data.quizSelected[0];
    var ok = checkAns(ua, q.answer, q.type);
    var results = this.data.quizResults.slice();
    results.push({ qid: q.id, ok: ok });
    var correctCount = 0;
    for (var i = 0; i < results.length; i++) { if (results[i].ok) correctCount++; }
    var quizRate = results.length > 0 ? Math.round(correctCount / results.length * 100) : 0;

    // Save
    var h = wx.getStorageSync("fe_history") || [];
    h.push({ qid: q.id, ans: ua, ok: ok, ts: new Date().toISOString() });
    if (h.length > 1000) h.splice(0, h.length - 1000);
    wx.setStorageSync("fe_history", h);

    var ca = normAnswer(q.answer || "", q.type || "");
    var states = this.computeOptionStates(q, this.data.quizSelected, true, ca);
    var msg = ok ? "✅ 回答正确!" : "❌ 回答错误，正确答案是 " + ca;

    this.setData({
      quizSubmitted: true, quizCorrect: ok, quizResults: results,
      correctCount: correctCount, quizRate: quizRate,
      optionsState: states, resultMsg: msg,
      resultClass: ok ? "result-correct" : "result-wrong",
    });
  },

  prevQuestion: function() {
    if (this.data.quizIdx > 0) {
      var idx = this.data.quizIdx - 1;
      var q = this.data.quizQuestions[idx];
      var prev = this.data.quizResults[idx];
      var ca = normAnswer(q.answer || "", q.type || "");
      var states = this.computeOptionStates(q, [], true, ca);
      this.setData({
        quizIdx: idx, quizSubmitted: true, quizCorrect: prev ? prev.ok : false,
        quizSelected: [], currentQuestion: q,
        qTypeLabel: TP[q.type] || q.type || "",
        correctAnswerDisplay: ca,
        displayOptions: (q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"],
        optionsState: states, resultMsg: "",
        resultClass: "",
      });
    }
  },

  nextQuestion: function() {
    if (this.data.quizIdx < this.data.quizQuestions.length - 1) {
      var idx = this.data.quizIdx + 1;
      var q = this.data.quizQuestions[idx];
      this.setData({
        quizIdx: idx, quizSubmitted: false, quizCorrect: false,
        quizSelected: [], currentQuestion: q,
        qTypeLabel: TP[q.type] || q.type || "",
        correctAnswerDisplay: "",
        displayOptions: (q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"],
        optionsState: [], resultMsg: "", resultClass: "",
        quizProgress: Math.round((idx) / this.data.quizQuestions.length * 100),
      });
    } else if (this.data.quizSubmitted) {
      this.setData({ quizFinished: true, quizProgress: 100 });
    }
  },

  retryQuiz: function() {
    var mode = this.data.quizMode;
    var chId = null;
    this.setData({ quizFinished: false, quizMode: null });
    this.startQuiz({ currentTarget: { dataset: { mode: mode, id: chId } } });
  },

  // Search
  doSearch: function(e) {
    var q = e.detail.value;
    this.setData({ searchQuery: q });
    if (!q.trim()) { this.setData({ searchKps: [], searchQs: [] }); return; }
    var lower = q.toLowerCase();
    var kps = [];
    var qs = [];
    for (var i = 0; i < DATA.knowledgePoints.length && kps.length < 20; i++) {
      var k = DATA.knowledgePoints[i];
      if (k.title.toLowerCase().indexOf(lower) > -1 || k.content.toLowerCase().indexOf(lower) > -1) kps.push(k);
    }
    for (var j = 0; j < DATA.questions.length && qs.length < 20; j++) {
      var qu = DATA.questions[j];
      if (qu.stem.toLowerCase().indexOf(lower) > -1 || (qu.analysis || "").toLowerCase().indexOf(lower) > -1) qs.push(qu);
    }
    this.setData({ searchKps: kps, searchQs: qs });
  },
});

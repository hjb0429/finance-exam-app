var DATA = require("../../utils/data.js");
var OPT = ["A", "B", "C", "D", "E", "F", "G", "H"];
var TP = { single_choice: "单选", multi_choice: "多选", true_false: "判断", calculation: "计算" };

function normAnswer(raw, type) {
  var t = (raw || "").trim();
  if (type === "true_false") {
    if (/^(true|正确|对|是|a|A)$/.test(t)) return "A";
    if (/^(false|错误|错|否|b|B)$/.test(t)) return "B";
    return t.toUpperCase();
  }
  if (type === "multi_choice") {
    var m = t.match(/[A-Za-z]/g);
    if (!m) return t.toUpperCase();
    var seen = {}; var letters = [];
    for (var i = 0; i < m.length; i++) {
      var l = m[i].toUpperCase();
      if (!seen[l]) { seen[l] = true; letters.push(l); }
    }
    return letters.sort().join("");
  }
  return t.toUpperCase().charAt(0);
}

function checkAns(user, correct, type) {
  var u = (user || "").trim();
  if (type === "multi_choice") {
    var m = u.match(/[A-Za-z]/g) || [];
    var seen = {}; var letters = [];
    for (var i = 0; i < m.length; i++) {
      var l = m[i].toUpperCase();
      if (!seen[l]) { seen[l] = true; letters.push(l); }
    }
    u = letters.sort().join("");
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

Page({
  data: {
    tab: "home",
    chapters: DATA.chapters.sort(function(a, b) { return a.order - b.order; }),
    guide: DATA.guides.guide || null,
    changes: DATA.guides.changes || null,
    chapterOpen: {},
    sectionOpen: {},
    kpOpen: {},
    kpDetail: {},
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
    currentQuestion: {},
    qTypeLabel: "",
    correctAnswerDisplay: "",
    displayOptions: [],
    correctCount: 0,
    quizRate: 0,
    quizProgress: 0,
    optStates: [],
    resultMsg: "",
    resultClass: "",
    chapterProgress: [],
    masteryPercent: 0,
    optLabels: OPT,
    calcInput: "",
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
    var kpDetail = {};
    for (var i = 0; i < DATA.sections.length; i++) {
      var s = DATA.sections[i];
      if (!sbc[s.chapterId]) sbc[s.chapterId] = [];
      sbc[s.chapterId].push({ id: s.id, title: s.title, order: s.order });
    }
    for (var j = 0; j < DATA.knowledgePoints.length; j++) {
      var k = DATA.knowledgePoints[j];
      if (!kbs[k.sectionId]) kbs[k.sectionId] = [];
      kbs[k.sectionId].push(k);
      kpDetail[k.id] = k.content;
    }
    var kpbc = {};
    for (var ci = 0; ci < DATA.chapters.length; ci++) {
      var ch = DATA.chapters[ci];
      kpbc[ch.id] = [];
      var secs = sbc[ch.id] || [];
      for (var si = 0; si < secs.length; si++) {
        var secKps = kbs[secs[si].id] || [];
        for (var ki = 0; ki < secKps.length; ki++) kpbc[ch.id].push(secKps[ki]);
      }
    }
    this.setData({ sectionsByChapter: sbc, kpsBySection: kbs, kpsByChapter: kpbc, kpDetail: kpDetail });
  },

  refreshStats: function() {
    var h = wx.getStorageSync("fe_history") || [];
    var mastered = 0, weak = 0;
    for (var i = 0; i < DATA.knowledgePoints.length; i++) {
      if (DATA.knowledgePoints[i].masteryLevel === "mastered") mastered++;
      if (DATA.knowledgePoints[i].masteryLevel === "weak") weak++;
    }
    var mp = DATA.knowledgePoints.length > 0 ? Math.round(mastered / DATA.knowledgePoints.length * 100) : 0;
    if (h.length === 0) {
      this.setData({ stats: { totalAttempts: 0, correctRate: 0, weakPoints: weak }, masteredKp: mastered, weakKp: weak, masteryPercent: mp });
      this.buildChapterProgress();
      return;
    }
    var correct = 0;
    for (var j = 0; j < h.length; j++) { if (h[j].ok) correct++; }
    this.setData({ stats: { totalAttempts: h.length, correctRate: Math.round(correct / h.length * 100), weakPoints: weak }, masteredKp: mastered, weakKp: weak, masteryPercent: mp });
    this.buildChapterProgress();
  },

  buildChapterProgress: function() {
    var cp = [];
    for (var i = 0; i < this.data.chapters.length; i++) {
      var ch = this.data.chapters[i];
      var kps = this.data.kpsByChapter[ch.id] || [];
      var mastered = 0;
      for (var j = 0; j < kps.length; j++) { if (kps[j].masteryLevel === "mastered") mastered++; }
      cp.push({ title: ch.title, mastered: mastered, total: kps.length, percent: kps.length > 0 ? Math.round(mastered / kps.length * 100) : 0 });
    }
    this.setData({ chapterProgress: cp });
  },

  switchTab: function(e) {
    var t = e.currentTarget.dataset.tab;
    this.setData({ tab: t });
    if (t === "analysis" || t === "home") this.refreshStats();
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

  toggleKpDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var ko = this.data.kpOpen;
    ko[id] = !ko[id];
    this.setData({ kpOpen: ko });
  },

  // ============ QUIZ ============
  startQuiz: function(e) {
    var mode = e.currentTarget.dataset.mode;
    var chId = e.currentTarget.dataset.id;
    var pool = [];
    if (mode === "chapter" && chId) {
      var sbc = this.data.sectionsByChapter;
      var secIds = [];
      var chSecs = sbc[chId] || [];
      for (var i = 0; i < chSecs.length; i++) secIds.push(chSecs[i].id);
      var kpIds = [];
      for (var j = 0; j < DATA.knowledgePoints.length; j++) {
        if (secIds.indexOf(DATA.knowledgePoints[j].sectionId) > -1) kpIds.push(DATA.knowledgePoints[j].id);
      }
      for (var k = 0; k < DATA.questions.length; k++) {
        if (kpIds.indexOf(DATA.questions[k].knowledgePointId) > -1) pool.push(DATA.questions[k]);
      }
    } else if (mode === "weak") {
      for (var l = 0; l < DATA.knowledgePoints.length; l++) {
        if (DATA.knowledgePoints[l].masteryLevel === "weak") {
          for (var m = 0; m < DATA.questions.length; m++) {
            if (DATA.questions[m].knowledgePointId === DATA.knowledgePoints[l].id) pool.push(DATA.questions[m]);
          }
        }
      }
      if (pool.length === 0) pool = DATA.questions.slice();
    } else {
      pool = DATA.questions.slice();
    }
    pool = shuffle(pool);
    var questions = pool.slice(0, 30);
    var q = questions[0] || {};
    var opts = (q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"];
    var initStates = [];
    for (var n = 0; n < opts.length; n++) initStates.push("opt-def");

    var isCalc = q && q.type === "calculation";
    this.setData({
      quizMode: mode, quizQuestions: questions, quizIdx: 0, quizResults: [],
      quizSelected: [], quizSubmitted: false, quizCorrect: false, quizFinished: false,
      currentQuestion: q, qTypeLabel: TP[q.type] || q.type || "",
      correctAnswerDisplay: isCalc ? (q.answer || "") : normAnswer(q.answer || "", q.type || ""),
      displayOptions: isCalc ? [] : opts, correctCount: 0, quizRate: 0, quizProgress: 0,
      optStates: initStates, resultMsg: "", resultClass: "", calcInput: "",
    });
  },

  quitQuiz: function() {
    this.setData({ quizMode: null, quizFinished: false, quizSubmitted: false, quizSelected: [], quizQuestions: [], quizResults: [], quizIdx: 0 });
  },

  onCalcInput: function(e) {
    this.setData({ calcInput: e.detail.value });
  },

  selectOption: function(e) {
    if (this.data.quizSubmitted) return;
    var q = this.data.quizQuestions[this.data.quizIdx];
    if (q.type === "calculation") return;
    var label = e.currentTarget.dataset.label;
    var sel = this.data.quizSelected.slice();
    if (q.type === "multi_choice") {
      var idx = sel.indexOf(label);
      if (idx > -1) sel.splice(idx, 1); else sel.push(label);
    } else {
      sel = [label];
    }
    this.setData({ quizSelected: sel, optStates: this.buildOptStates(q, sel, false, "") });
  },

  buildOptStates: function(q, selected, submitted, correctAnswer) {
    var opts = (q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"];
    var states = [];
    for (var i = 0; i < opts.length; i++) {
      var label = OPT[i];
      if (submitted) {
        if (correctAnswer.indexOf(label) > -1) states.push("opt-ok");
        else if (selected.indexOf(label) > -1) states.push("opt-err");
        else states.push("opt-def");
      } else {
        if (selected.indexOf(label) > -1) states.push("opt-sel");
        else states.push("opt-def");
      }
    }
    return states;
  },

  submitAnswer: function() {
    var q = this.data.quizQuestions[this.data.quizIdx];
    var isCalc = q.type === "calculation";
    var ua, ok;

    if (isCalc) {
      ua = (this.data.calcInput || "").trim();
      if (!ua) return; // Don't submit empty
      var correctAns = (q.answer || "").trim();
      ok = ua === correctAns || ua.toLowerCase() === correctAns.toLowerCase();
    } else {
      if (this.data.quizSelected.length === 0) return;
      ua = q.type === "multi_choice" ? this.data.quizSelected.slice().sort().join(",") : this.data.quizSelected[0];
      ok = checkAns(ua, q.answer, q.type);
    }

    var results = this.data.quizResults.slice();
    results.push({ qid: q.id, ok: ok });
    var correctCount = 0;
    for (var i = 0; i < results.length; i++) { if (results[i].ok) correctCount++; }
    var rate = results.length > 0 ? Math.round(correctCount / results.length * 100) : 0;
    var h = wx.getStorageSync("fe_history") || [];
    h.push({ qid: q.id, ans: ua, ok: ok, ts: new Date().toISOString() });
    if (h.length > 1000) h.splice(0, h.length - 1000);
    wx.setStorageSync("fe_history", h);
    var ca = isCalc ? (q.answer || "") : normAnswer(q.answer || "", q.type || "");
    var states = isCalc ? [] : this.buildOptStates(q, this.data.quizSelected, true, ca);
    var msg = ok ? "回答正确!" : "回答错误，正确答案是 " + ca;
    this.setData({
      quizSubmitted: true, quizCorrect: ok, quizResults: results,
      correctCount: correctCount, quizRate: rate, optStates: states,
      resultMsg: msg, resultClass: ok ? "result-correct" : "result-wrong",
    });
  },

  prevQuestion: function() {
    if (this.data.quizIdx > 0) {
      var idx = this.data.quizIdx - 1;
      var q = this.data.quizQuestions[idx];
      var isCalc = q.type === "calculation";
      var ca = isCalc ? (q.answer || "") : normAnswer(q.answer || "", q.type || "");
      var opts = isCalc ? [] : ((q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"]);
      this.setData({
        quizIdx: idx, quizSubmitted: true, quizCorrect: this.data.quizResults[idx] ? this.data.quizResults[idx].ok : false,
        quizSelected: [], currentQuestion: q, qTypeLabel: TP[q.type] || q.type || "",
        correctAnswerDisplay: ca, displayOptions: opts,
        optStates: isCalc ? [] : this.buildOptStates(q, [], true, ca),
        resultMsg: "", resultClass: "", quizProgress: Math.round(idx / this.data.quizQuestions.length * 100),
        calcInput: "",
      });
    }
  },

  nextQuestion: function() {
    if (this.data.quizIdx < this.data.quizQuestions.length - 1) {
      var idx = this.data.quizIdx + 1;
      var q = this.data.quizQuestions[idx];
      var isCalc = q.type === "calculation";
      var opts = isCalc ? [] : ((q.options && q.options.length > 0) ? q.options : ["A. 正确", "B. 错误"]);
      var initStates = [];
      if (!isCalc) { for (var i = 0; i < opts.length; i++) initStates.push("opt-def"); }
      this.setData({
        quizIdx: idx, quizSubmitted: false, quizCorrect: false,
        quizSelected: [], currentQuestion: q, qTypeLabel: TP[q.type] || q.type || "",
        correctAnswerDisplay: "", displayOptions: opts,
        optStates: initStates, resultMsg: "", resultClass: "",
        quizProgress: Math.round(idx / this.data.quizQuestions.length * 100),
        calcInput: "",
      });
    } else if (this.data.quizSubmitted) {
      this.setData({ quizFinished: true, quizProgress: 100 });
    }
  },

  retryQuiz: function() {
    var mode = this.data.quizMode;
    this.setData({ quizFinished: false, quizMode: null });
    this.startQuiz({ currentTarget: { dataset: { mode: mode } } });
  },

  // ============ SEARCH ============
  doSearch: function(e) {
    var q = e.detail.value;
    this.setData({ searchQuery: q });
    if (!q.trim()) { this.setData({ searchKps: [], searchQs: [] }); return; }
    var lower = q.toLowerCase();
    var kps = [], qs = [];
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

import { checkAnswer, normalizeAnswer } from "./answer-utils";

// Multi-choice: AI stores "ABCD", user submits "A,B,C,D"
console.log("Multi A,B,C,D vs ABCD:", checkAnswer("A,B,C,D", "ABCD", "multi_choice"));

// Multi-choice: AI stores "AC", user submits "A,C"
console.log("Multi A,C vs AC:", checkAnswer("A,C", "AC", "multi_choice"));

// Multi-choice wrong
console.log("Multi A,B vs ABCD:", checkAnswer("A,B", "ABCD", "multi_choice"));

// True/False: "true" vs A
console.log("T/F A vs true:", checkAnswer("A", "true", "true_false"));

// True/False: "false" vs B
console.log("T/F B vs false:", checkAnswer("B", "false", "true_false"));

// True/False: Chinese
console.log("T/F A vs 正确:", checkAnswer("A", "正确", "true_false"));
console.log("T/F B vs 错误:", checkAnswer("B", "错误", "true_false"));

// Single choice - negated question
console.log("Single D vs D:", checkAnswer("D", "D", "single_choice"));

// Single choice - wrong
console.log("Single A vs D:", checkAnswer("A", "D", "single_choice"));

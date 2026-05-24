import { NextRequest, NextResponse } from "next/server";
import { createQuizAttempt, getQuestionById } from "@/lib/store";
import { checkAnswer } from "@/lib/answer-utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { questionId, userAnswer } = body;

  if (!questionId) {
    return NextResponse.json(
      { error: "缺少题目ID" },
      { status: 400 }
    );
  }

  const question = getQuestionById(questionId);
  if (!question) {
    return NextResponse.json(
      { error: "题目不存在" },
      { status: 404 }
    );
  }

  const isCorrect = checkAnswer(userAnswer, question.answer, question.type);

  const attempt = createQuizAttempt({
    questionId,
    userAnswer,
    isCorrect,
  });

  return NextResponse.json({
    attempt,
    isCorrect,
    correctAnswer: question.answer,
    analysis: question.analysis,
  });
}

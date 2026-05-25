/**
 * Seed script: populates the data store with sample content for testing.
 * Run with: npx tsx src/lib/seed.ts
 * Or import and call seedData() from an API route.
 */

import { importParsedContent } from "./store";
import type { ParsedPdfContent } from "./types";

const sampleData: ParsedPdfContent = {
  chapters: [
    {
      title: "第一章 财务管理基础",
      order: 1,
      sections: [
        {
          title: "第一节 财务管理概述",
          order: 1,
          knowledgePoints: [
            {
              title: "财务管理的概念",
              content:
                "财务管理是企业管理的重要组成部分，是有关资金的筹集、投放和分配的管理工作。其核心是财务决策。",
            },
            {
              title: "财务管理目标",
              content:
                "企业财务管理的目标包括利润最大化、每股收益最大化、股东财富最大化。现代财务管理理论认为股东财富最大化是最合理的目标。",
            },
            {
              title: "财务管理环境",
              content:
                "财务管理环境包括经济环境、法律环境、金融市场环境。利率、通货膨胀、经济周期等宏观经济因素直接影响企业财务决策。",
            },
          ],
        },
        {
          title: "第二节 货币时间价值",
          order: 2,
          knowledgePoints: [
            {
              title: "货币时间价值的概念",
              content:
                "货币时间价值是指货币经历一定时间的投资和再投资所增加的价值。今天的一元钱比未来的一元钱更有价值。",
            },
            {
              title: "复利终值与现值",
              content:
                "复利终值 F=P(1+i)^n，复利现值 P=F/(1+i)^n。其中i为利率，n为期数。复利计算体现了'利滚利'的特点。",
            },
            {
              title: "年金终值与现值",
              content:
                "年金是指等额、定期的系列收支。普通年金终值 F=A[(1+i)^n-1]/i，普通年金现值 P=A[1-(1+i)^-n]/i。",
            },
          ],
        },
        {
          title: "第三节 风险与收益",
          order: 3,
          knowledgePoints: [
            {
              title: "风险的概念与分类",
              content:
                "风险是指在一定条件下和一定时期内可能发生的各种结果的变动程度。分为系统风险（不可分散）和非系统风险（可分散）。",
            },
            {
              title: "资本资产定价模型(CAPM)",
              content:
                "CAPM公式：Ri = Rf + βi(Rm - Rf)。其中Ri为资产i的期望收益率，Rf为无风险利率，βi为资产i的贝塔系数，Rm为市场组合的期望收益率。",
            },
          ],
        },
      ],
    },
    {
      title: "第二章 财务报表分析",
      order: 2,
      sections: [
        {
          title: "第一节 财务报表分析概述",
          order: 1,
          knowledgePoints: [
            {
              title: "财务报表分析的目的",
              content:
                "财务报表分析是评价企业财务状况、经营成果和现金流量的重要手段，为投资者、债权人、管理层等利益相关者提供决策依据。",
            },
            {
              title: "财务报表分析方法",
              content:
                "主要分析方法包括：比较分析法、趋势分析法、因素分析法、比率分析法。比率分析法是最常用的方法。",
            },
          ],
        },
        {
          title: "第二节 财务比率分析",
          order: 2,
          knowledgePoints: [
            {
              title: "偿债能力比率",
              content:
                "流动比率=流动资产/流动负债（一般认为2:1较合理）；速动比率=(流动资产-存货)/流动负债；资产负债率=负债总额/资产总额。",
            },
            {
              title: "盈利能力比率",
              content:
                "销售净利率=净利润/销售收入；总资产净利率(ROA)=净利润/总资产；净资产收益率(ROE)=净利润/股东权益。ROE是衡量股东回报的核心指标。",
            },
            {
              title: "营运能力比率",
              content:
                "应收账款周转率=销售收入/应收账款平均余额；存货周转率=销售成本/存货平均余额；总资产周转率=销售收入/总资产平均余额。",
            },
          ],
        },
      ],
    },
  ],
  questions: [
    // Chapter 1 questions
    {
      knowledgePointTitle: "财务管理的概念",
      type: "single_choice",
      stem: "财务管理区别于其他管理的主要特点是：",
      options: [
        "A. 劳动管理",
        "B. 物资管理",
        "C. 价值管理",
        "D. 信息管理",
      ],
      answer: "C",
      analysis:
        "财务管理是价值管理，它利用资金、成本、收入等价值指标来组织企业中的价值形成、实现和分配。",
      difficulty: 1,
    },
    {
      knowledgePointTitle: "财务管理目标",
      type: "single_choice",
      stem: "现代财务管理理论认为，最合理的企业财务管理目标是：",
      options: [
        "A. 利润最大化",
        "B. 每股收益最大化",
        "C. 股东财富最大化",
        "D. 企业规模最大化",
      ],
      answer: "C",
      analysis:
        "股东财富最大化考虑了货币时间价值和风险因素，也克服了利润最大化的短期行为，是公认的最合理目标。",
      difficulty: 1,
    },
    {
      knowledgePointTitle: "财务管理目标",
      type: "true_false",
      stem: "利润最大化作为财务管理目标，其优点之一是考虑了货币时间价值。",
      options: ["A. 正确", "B. 错误"],
      answer: "B",
      analysis:
        "利润最大化目标没有考虑货币时间价值，也没有考虑风险因素，这是它的主要缺陷。",
      difficulty: 2,
    },
    {
      knowledgePointTitle: "复利终值与现值",
      type: "single_choice",
      stem: "某人将10000元存入银行，年利率为5%，按年复利计息，5年后的终值约为：",
      options: [
        "A. 12500元",
        "B. 12763元",
        "C. 12840元",
        "D. 13000元",
      ],
      answer: "B",
      analysis:
        "F = P(1+i)^n = 10000 × (1+5%)^5 = 10000 × 1.2763 ≈ 12763元",
      difficulty: 2,
    },
    {
      knowledgePointTitle: "年金终值与现值",
      type: "calculation",
      stem: "某人每年年末存入银行10000元，年利率为4%，按年复利计息，3年后的年金终值是多少？",
      options: [
        "A. 30000元",
        "B. 31216元",
        "C. 32486元",
        "D. 33100元",
      ],
      answer: "B",
      analysis:
        "普通年金终值 F = A[(1+i)^n-1]/i = 10000 × [(1+4%)^3-1]/4% = 10000 × 3.1216 = 31216元",
      difficulty: 3,
    },
    {
      knowledgePointTitle: "资本资产定价模型(CAPM)",
      type: "single_choice",
      stem: "某股票β系数为1.5，无风险利率为3%，市场平均收益率为9%，则该股票的期望收益率为：",
      options: ["A. 9%", "B. 10.5%", "C. 12%", "D. 13.5%"],
      answer: "C",
      analysis:
        "根据CAPM：Ri = Rf + β(Rm-Rf) = 3% + 1.5×(9%-3%) = 3% + 9% = 12%",
      difficulty: 2,
    },
    // Chapter 2 questions
    {
      knowledgePointTitle: "偿债能力比率",
      type: "single_choice",
      stem: "下列指标中，属于短期偿债能力指标的是：",
      options: [
        "A. 资产负债率",
        "B. 利息保障倍数",
        "C. 流动比率",
        "D. 权益乘数",
      ],
      answer: "C",
      analysis:
        "流动比率=流动资产/流动负债，是衡量企业短期偿债能力的重要指标。资产负债率和利息保障倍数属于长期偿债能力指标。",
      difficulty: 2,
    },
    {
      knowledgePointTitle: "盈利能力比率",
      type: "single_choice",
      stem: "杜邦分析体系的核心指标是：",
      options: [
        "A. 总资产净利率(ROA)",
        "B. 销售净利率",
        "C. 净资产收益率(ROE)",
        "D. 总资产周转率",
      ],
      answer: "C",
      analysis:
        "杜邦分析体系以净资产收益率(ROE)为核心，将其分解为：ROE = 销售净利率 × 总资产周转率 × 权益乘数。",
      difficulty: 3,
    },
    {
      knowledgePointTitle: "营运能力比率",
      type: "true_false",
      stem: "应收账款周转率越高，说明企业收回应收账款的速度越快。",
      options: ["A. 正确", "B. 错误"],
      answer: "A",
      analysis:
        "应收账款周转率=销售收入/应收账款平均余额，周转率越高，表明企业收回应收账款的速度越快，资金利用效率越高。",
      difficulty: 1,
    },
    {
      knowledgePointTitle: "偿债能力比率",
      type: "multi_choice",
      stem: "下列各项中，影响速动比率的因素有：",
      options: [
        "A. 应收账款",
        "B. 存货",
        "C. 短期借款",
        "D. 预付账款",
      ],
      answer: "A,C,D",
      analysis:
        "速动比率=(流动资产-存货)/流动负债。速动资产包括货币资金、交易性金融资产、应收账款、预付账款等，不包括存货。",
      difficulty: 3,
    },
    {
      knowledgePointTitle: "财务报表分析方法",
      type: "single_choice",
      stem: "将企业连续若干期的财务报表数据进行对比分析的方法称为：",
      options: [
        "A. 比率分析法",
        "B. 比较分析法",
        "C. 趋势分析法",
        "D. 因素分析法",
      ],
      answer: "C",
      analysis:
        "趋势分析法是将企业连续若干期的财务报表数据进行对比，以揭示企业财务状况和经营成果变化趋势的分析方法。",
      difficulty: 1,
    },
    {
      knowledgePointTitle: "盈利能力比率",
      type: "calculation",
      stem: "某企业净利润为200万元，总资产为2000万元，股东权益为1000万元，则该企业的净资产收益率(ROE)为：",
      options: ["A. 10%", "B. 15%", "C. 20%", "D. 40%"],
      answer: "C",
      analysis:
        "ROE = 净利润/股东权益 = 200/1000 = 20%。注意与ROA区分：ROA = 200/2000 = 10%。",
      difficulty: 2,
    },
  ],
};

export async function seedData() {
  const result = await importParsedContent(sampleData);
  console.log("Seed data imported:", result);
  return result;
}

// Allow running directly
if (require.main === module) {
  seedData();
}

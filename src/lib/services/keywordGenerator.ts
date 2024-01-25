import { config } from "../../config";
import Keyword from "../db/schemas/keyword";

import { ChatPromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "langchain/chat_models/openai";
import CommaSeparatedListOutputParser from "./utils";

const template =
  "You are a helpful assistant who generates comma separated SEO keyword lists. A user will pass in niche, context and amount of keywords, you must generate the correct LONG TAIL SEO keywords in a comma separated list based from the provided text. It must match the provided niche. ONLY return a comma separated list, and nothing more.";

const humanTemplate = "niche: {niche}, context: {context}, {count} keywords";

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", template],
  ["human", humanTemplate],
]);

const model = new ChatOpenAI({ openAIApiKey: config.keys.openai });
const parser = new CommaSeparatedListOutputParser();
const chain = chatPrompt.pipe(model).pipe(parser);

async function getAIKeywords(niche: string, context: string, count: number) {
  const result = await chain.invoke({
    niche: niche,
    context: context,
    count: count,
  });
  return result;
}

interface KeywordData {
  email: string;
  niche: string;
  context: string;
  count: number;
  taskId: string;
}

export async function writeKeywords(data: KeywordData) {
  console.log("Writing keywords! ", data.email, data.niche);

  const dbKeyword = new Keyword();
  dbKeyword.email = data.email;
  dbKeyword.niche = data.niche;
  dbKeyword.context = data.context;
  dbKeyword.count = data.count;
  dbKeyword.isFinished = false;
  dbKeyword.taskId = data.taskId;
  await dbKeyword.save();

  const keywords = await getAIKeywords(data.niche, data.context, data.count);

  dbKeyword.keywords = keywords;
  dbKeyword.isFinished = true;
  await dbKeyword.save();
  console.log("Finished creating keywords", data.email, data.niche, keywords);

  return dbKeyword;
}

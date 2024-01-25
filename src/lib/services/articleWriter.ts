import { config } from "../../config";

import { HumanMessage } from "@langchain/core/messages";

import { ChatPromptTemplate } from "langchain/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { ChatOpenAI } from "langchain/chat_models/openai";

import { Article, ArticleData, TaskData } from "../db/schemas";
import { dbSaver } from "../db/saver";
import buildArticleKey from "./utils";
import { generateImage } from "./imageGenerator";

const model = new ChatOpenAI({ openAIApiKey: config.keys.openai });

async function callGPT(template: string, humanTemplate: string, body: Object) {
  const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", template],
    ["human", humanTemplate],
  ]);

  const chain = chatPrompt.pipe(model);
  const result = await chain.invoke(body);
  return result.toDict().data.content;
}

async function writeArticleOutline(keyword: string, niche: string) {
  const parser = new JsonOutputFunctionsParser();

  const extractionFunctionSchema = {
    name: "outline",
    description: "Writes outline of an article.",
    parameters: {
      type: "object",
      properties: {
        outline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "title of the section",
              },
              paragraphs: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "ann aray of strings representing title of each paragraph in the section",
              },
            },
          },
        },
      },
      required: ["outline"],
    },
  };

  const runnable = model
    .bind({
      functions: [extractionFunctionSchema],
      function_call: { name: "outline" },
    })
    .pipe(parser);

  const result = await runnable.invoke([
    new HumanMessage(
      `Write a 2000 word article outline for my website. For introduction and conclusion only one paragraph should be written. \nArticle niche: ${niche}, keyword: ${keyword}`,
    ),
  ]);

  return result;
}

async function writeParagraph(taskData: TaskData) {
  const template =
    "You are a senior content writer. Write a 100-200 word paragraph. The paragraph must be extensive on the provided niche and keyword. Never mention yourself in the article or anything about AI. Don't add such tags like Introduction, Conclusion, etc. Paragraphs must be very professional and with emotion. You will be given a niche, a keyword, a title and a paragraph description, write an article based on the keyword for that niche.";

  const humanTemplate =
    "niche: {niche}, keyword: {keyword}, paragraph title: {title}, paragraph description: {paragraph}";

  return await callGPT(template, humanTemplate, {
    keyword: taskData.keyword,
    niche: taskData.niche,
    title: taskData.title,
    paragraph: taskData.paragraph,
  });
}

function joinArticle(sections: Array<{ title: string; paragraph: string }>) {
  let article = "";
  for (const section of sections) {
    article += section.title;
    article += "\n\n";
    article += section.paragraph;
    article += "\n\n";
  }
  return article;
}

function getTitleTag(index: number) {
  let titleTag = "h3";
  if (index === 1) {
    titleTag = "h1";
  }
  if (index === 2) {
    titleTag = "h2";
  }
  return titleTag;
}

export async function writeArticle(data: ArticleData): Promise<Article> {
  const logInfo = `${data.website} ${data.keyword} ${data.niche}`;
  console.log("Initiating article writing! ", logInfo);

  const response = await writeArticleOutline(data.keyword, data.niche);
  const outline = response.outline;
  console.log(outline);
  console.log("Outline Done!", logInfo);

  const sections = [];

  for (const section of outline) {
    console.log("Writing section", section.title, logInfo);

    let index = 0;
    for (const paragraph of section.paragraphs) {
      index++;

      console.log("Writing paragraph", paragraph);
      const writtenParagraph = await writeParagraph({
        niche: data.niche,
        keyword: data.keyword,
        title: section.title,
        paragraph: paragraph,
      });

      const titleTag = getTitleTag(index);

      sections.push({
        title: `<${titleTag}>${section.title}</${titleTag}>`,
        paragraph: `<p>${writtenParagraph}</p>`,
      });

      console.log(
        "Done writing paragraph",
        `${writeParagraph.length} words`,
        logInfo,
      );
    }
  }

  const articleText = joinArticle(sections);

  const imageUrl = await generateImage(data.keyword);

  const dbArticle: Article = {
    website: data.website,
    keyword: data.keyword,
    niche: data.niche,
    isFinished: true,
    taskId: data.taskId,
    words: articleText.split(" ").length,
    article: articleText,
    imageUrl: imageUrl,
    date: new Date(),
  };

  console.log("Finished writing full article", logInfo);

  await dbSaver.save(dbArticle, buildArticleKey(data.website));

  console.log("Finished creating article", logInfo);
  return dbArticle;
}

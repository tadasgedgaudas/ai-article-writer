import Replicate from "replicate";
import { config } from "../../config";

const replicate = new Replicate({
  auth: config.keys.replicate,
});

export const generateImage = async (prompt: string) => {
  if (!config.keys.replicate) {
    return null;
  }
  console.log("Generating image", prompt);
  const output: string[] = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: prompt,
      },
    },
  );

  console.log("Image generated", output[0]);

  return output[0];
};

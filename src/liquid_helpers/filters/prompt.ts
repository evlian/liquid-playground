import { Value } from 'liquidjs';
import * as vscode from 'vscode';

export async function performChatRequest(craftedPrompt: string): Promise<string> {
    try {
      const models = await vscode.lm.selectChatModels({
        vendor: 'copilot'
      });

      const [model] = models

      console.log(JSON.stringify(models))

      console.log(JSON.stringify(model))

      const craftedPrompt = [
        vscode.LanguageModelChatMessage.User(
          'You are a cat! Think carefully and step by step like a cat would. Your job is to explain computer science concepts in the funny manner of a cat, using cat metaphors. Always start your response by stating what concept you are explaining. Always include code samples.'
        ),
        vscode.LanguageModelChatMessage.User('I want to understand recursion')
      ];
  
      const requestResult = await model.sendRequest(craftedPrompt, {});
      return "guy goes into a bar"
      
    } catch (err) {
      if (err instanceof vscode.LanguageModelError) {
        console.log(err.message, err.code, err.cause);
        if (err.cause instanceof Error && err.cause.message.includes('off_topic')) {
        }

        console.warn(err)
      } else {
        console.warn(err)
        throw err;
      }

      throw err;
    }
  }
  
  export function performChatRequestSync(craftedPrompt: string): any {
    let result: any;
    let error: any;
  
    // Immediately Invoked Function Expression (IIFE) to handle async code in sync context
    (async () => {
      try {
        result = await performChatRequest(craftedPrompt);
      } catch (err) {
        error = err;
      }
    })();
  
    // Busy wait for result or error
    while (result === undefined && error === undefined) {
      // This is a busy wait loop and is generally not recommended due to performance issues
    }
  
    if (error){ throw error};
    return result;
  }
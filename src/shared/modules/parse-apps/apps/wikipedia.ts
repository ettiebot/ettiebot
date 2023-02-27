import { YouChatResponse } from '../../../ts/youchat.js';
import { WikipediaAppDatum } from '../../../ts/youchat/wikipedia.js';

export default function wikipediaAppParser(
  data: WikipediaAppDatum,
): Partial<YouChatResponse> {
  void data;
  console.log(data);
  if (!data) return {};
  else
    return {
      text: `I found the information on Wikipedia, article named ${data.title}:\n\n${data.intro}`,
    };
}

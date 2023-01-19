import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const dish = req.body.dish || '';
  if (dish.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid dish",
      }
    });
    return;
  }

  try {
    console.log('Processing completion...');
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(dish),
      temperature: 0.6,
      max_tokens: 300
    });
    let imgUrl = "https://cdn-icons-png.flaticon.com/512/5894/5894030.png"
    let generatedRecipe = completion.data.choices[0].text;
    if (generatedRecipe != '') {
      let resultDish = generatedRecipe.split('Dish: ')[1].split('\n')[0];
      console.log('Processing image generation...');
      const image = await openai.createImage({
        prompt: resultDish,
        n: 1,
        size: "512x512"
      });
      imgUrl = image.data.data[0].url;
    }
    
    res.status(200).json({ result: completion.data.choices[0].text.trim(), imgUrl: imgUrl });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(dish) {
  const capitalizedDish =
    dish[0].toUpperCase() + dish.slice(1).toLowerCase();
  return `Suggest a recipe with ${capitalizedDish} as ingredients following this format:

Dish: (Name of the Dish)
Ingredients: 
(Place all the ingredients here with measurements)

Instructions:
(Place step-by-step instructions here chronologically)
`;
}

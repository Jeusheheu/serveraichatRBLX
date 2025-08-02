const app = require("express")();
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");

const PORT = 8080;

globalThis.fetch = fetch;
globalThis.Headers = fetch.Headers;
globalThis.Request = fetch.Request;
globalThis.Response = fetch.Response;

app.use(bodyParser.json());

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const {
    response
} = require("express");

const apikey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apikey);

const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    responseMimeType: "text/plain"
}

async function run(prompt, history) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        })

        const chatsession = model.startChat({
            generationConfig,
            history: history,
        })

        const result = await chatsession.sendMessage(prompt);
        return {
            Response: true,
            Text: result.response.text()
        };
    }catch(error){
        return {
            Response: false,
            Text: error
        };
    }
}

app.post("/",async (req, res) => {
    const prompt = req.body.prompt;
    const history = req.body.history;
    
  const response = await run(prompt, history);

  if (response.Response == true ){
    res.status(200).send(response.Text);
  }else{
    res.status(500).send("Server Error")  
  }
})

app.listen(PORT, () =>  console.log("Working"));
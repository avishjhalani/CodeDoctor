import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Editor from "@monaco-editor/react";
import Select from "react-select";
import { FiZap, FiSearch } from "react-icons/fi";
import Markdown from "react-markdown";


const App = () => {
  const options = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
  ];

  const defaultCode = {
    javascript: "console.log('Hello World');",
    python: "print('Hello World')",
    java:
      "class Main { public static void main(String[] args){ System.out.println('Hello'); }}",
    cpp:
      "#include <iostream>\nint main(){ std::cout << 'Hello'; }",
  };

  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [code, setCode] = useState(defaultCode[options[0].value]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#111113",
      borderColor: "#27272a",
      color: "#fff",
    }),
    singleValue: (p) => ({ ...p, color: "#fff" }),
  };

  // 🔥 AI CALL FUNCTION
  const callAI = async (type) => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "user",
              content:
                type === "fix"
                  ? `You are an expert-level software developer.

                      Fix the following code and return the response in this format:

                      ### ✅ Fixed Code
                      \`\`\`${selectedOption.value}
                      <fixed code here>
                      \`\`\`

                      ### 💡 Explanation
                      - Explain what was wrong
                      - Explain what you fixed
                      - Mention best practices used

                      Code:
                      ${code}`: `You are an expert-level software developer, skilled in writing efficient, clean, and advanced code.

                      You are reviewing code written in ${selectedOption.label}.

                      Your job is to deeply review this code like a senior developer reviewing a pull request.

                      Provide the response in the following structured format:

                      ### ⭐ Quality Rating
                      (Better / Good / Normal / Bad)

                      ### 🔍 Code Explanation
                      Explain what the code does clearly.

                      ### ❌ Issues Found
                      - List bugs or logical errors (if any)

                      ### 🚀 Improvements
                      - Suggest best practices
                      - Suggest optimizations
                      - Suggest cleaner alternatives

                      ### 🛠 Fixed / Improved Code (if needed)
                      \`\`\`${selectedOption.value}
                      <improved code here>
                      \`\`\`

                      Analyze thoroughly and be precise.

                      Code:
                      ${code}`
            },
          ],
        }),
      });

      const data = await res.json();
      setResponse(data.choices[0].message.content);
    } catch (err) {
      setResponse("Error fetching response");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="flex gap-4 p-4 bg-[#0f0f11]" style={{ height: "calc(100vh - 70px)" }}>

        {/* LEFT */}
        <div className="flex flex-col w-1/2 bg-[#18181b] rounded-xl border border-zinc-800 overflow-hidden">

          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-[#111113]">

            <div className="w-[200px]">
              <Select
                value={selectedOption}
                onChange={(option) => {
                  setSelectedOption(option);
                  setCode(defaultCode[option.value]);
                }}
                options={options}
                styles={customStyles}
              />
            </div>

            <button
              onClick={() => callAI("fix")}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-lg"
            >
              <FiZap /> Fix Code
            </button>

            <button
              onClick={() => callAI("review")}
              className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-lg"
            >
              <FiSearch /> Review
            </button>
          </div>

          <Editor
            height="100%"
            theme="vs-dark"
            language={selectedOption.value}
            value={code}
            onChange={(value) => setCode(value)}
          />
        </div>

        {/* RIGHT */}
        <div className="flex flex-col w-1/2 bg-[#18181b] rounded-xl border border-zinc-800 overflow-hidden">

          <div className="px-4 flex items-center h-[60px] border-b border-zinc-800 bg-[#111113]">
            <p className="font-semibold">AI Response</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-sm text-zinc-300">
            <div className="bg-[#0f0f11] p-4 rounded-lg border border-zinc-800 whitespace-pre-wrap">
              {loading ? "Thinking..." : response || "Your AI response will appear here..."}
            </div>

            <Markdown>{response}</Markdown>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
"use client";

import { Inter } from "next/font/google";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
const inter = Inter({ subsets: ["latin"] });

async function getSentimentsData(chunksPerDocument: number) {
  const response = await fetch(
    "http://127.0.0.1:5000/sentiments?chunks_per_document=" + chunksPerDocument,
    {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers if needed
      },
    }
  );
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return await response.json();
}
function Sentiments() {
  const [sentimentData, setSentimentData] = useState(null);
  const [chunksPerDocument, setChunksPerDocument] = useState(10);
  useEffect(() => {
    getSentimentsData(chunksPerDocument).then((sentimentData) =>
      setSentimentData(sentimentData)
    );
  }, [chunksPerDocument]);

  const documentNames: string[] =
    sentimentData !== null ? Object.keys(sentimentData) : [];
  return (
    <div
      className={`${inter.className} flex flex-col h-[100vh] w-full justify-center items-center bg-black`}
    >
      <div>
        <div className="w-full">
          <span className="text-white rounded-lg py-4 font-extrabold text-[2rem] z-0">
            <a href={"/keywords"} className="text-gray-400 cursor-pointer">
              KEYWORDS
            </a>{" "}
            | SENTIMENTS
          </span>
        </div>
        <div className="border-2 border-solid border-white rounded-md p-4 flex flex-col justify-between z-10 w-[861px]">
          <div className="flex w-full justify-between">
            <div className="text-xs text-gray-400">Document Name</div>
            <div className="text-xs text-gray-400">Avg Sentiment</div>
          </div>
          {sentimentData !== null && (
            <Accordion type="single" collapsible>
              {documentNames.map((name: string, index: number) => {
                const textChunks: string[] = Object.keys(
                  sentimentData[name]["chunk_sentiments"]
                );
                const chunkSentiments: number[] = Object.values(
                  sentimentData[name]["chunk_sentiments"]
                );
                return (
                  <AccordionItem value={name} key={name}>
                    <AccordionTrigger className="text-white flex justify-between w-full">
                      <span className="text-white w-full text-left">
                        {name.length > 40
                          ? name.substring(0, 40) + "..."
                          : name}
                      </span>
                      <span className="text-black bg-white px-2 py-0.25 rounded-md mx-1">
                        {sentimentData[name]["avg_sentiment"]}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="w-full max-h-48 overflow-scroll">
                      <div className="flex flex-col justify-between items-center">
                        <div className="flex justify-between w-full">
                          <span className="text-xs text-gray-400 ">
                            Text Chunks
                          </span>
                          <span className="text-xs text-gray-400">
                            Chunk Sentiment
                          </span>
                        </div>
                        {textChunks.map((chunk, index) => (
                          <div
                            className="flex justify-between items-center py-2 gap-40"
                            key={index}
                          >
                            <span className="text-white w-[640px]">
                              {chunk}
                            </span>
                            <span className="text-black bg-white px-2 py-0.25 rounded-md">
                              {chunkSentiments[index]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
        <div className="w-full flex justify-end mt-1">
          <span className="text-xs text-gray-400 right-0">
            Made for Assignment of ByteGenie
          </span>
        </div>
      </div>
    </div>
  );
}

export default Sentiments;

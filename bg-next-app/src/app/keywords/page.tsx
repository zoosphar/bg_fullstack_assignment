import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

async function getKeywordsData() {
  const response = await fetch("http://127.0.0.1:5000/keywords", {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      // Add any other headers if needed
    },
  });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

type KeywordsDataType = {
  documentNames: string[];
  keywords: string[][];
};

async function Keywords() {
  const data = await getKeywordsData();
  const keywords: KeywordsDataType = {
    documentNames: Object.keys(data),
    keywords: Object.values(data),
  };
  return (
    <div
      className={`${inter.className} flex flex-col h-[100vh] w-full justify-center items-center bg-black`}
    >
      <div>
        <div className="w-full">
          <span className="text-white rounded-lg py-4 font-extrabold text-[2rem] z-0">
            KEYWORDS |{" "}
            <a href={"/sentiments"} className="text-gray-400 cursor-pointer">
              SENTIMENTS
            </a>
          </span>
        </div>
        <div className="border-2 border-solid border-white rounded-md p-4 flex z-10 gap-40">
          <div>
            <div className="text-xs text-gray-400">Document Name</div>

            {keywords?.documentNames.map((name: string) => (
              <>
                <div key={name} className="flex gap-2 py-2 text-white">
                  {name.length > 40 ? name.substring(0, 40) + "..." : name}
                </div>
              </>
            ))}
          </div>
          <div>
            <div className="text-xs text-gray-400">Keywords</div>
            {keywords?.keywords.map((keywordArray) => (
              <>
                <div className="flex gap-2 py-2">
                  {keywordArray.map((keyword: string, index: number) => (
                    <span
                      key={keyword}
                      className="text-black bg-white px-2 py-0.25 rounded-md"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </>
            ))}
          </div>
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

export default Keywords;

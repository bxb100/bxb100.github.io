import { useEffect, useState } from "react";
import markdownit from "markdown-it";

export default function DeathPlan() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [text, setText] = useState<string>("Not yet");
  const [status, setStatus] = useState<string>("Alive");

  useEffect(() => {
    fetch("/death-plan.md")
      .then(async res => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.text();
      })
      .then(data => {
        let html = markdownit().render(data);
        setText(html);
        setStatus("Dead");
      })
      .catch(err => {
        console.error(err);
        setStatus("Alive");
        setText("Not yet");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div>
      {status == "Alive" ? (
        <>
          <h2>Status</h2>
          <p>Still Alive</p>
        </>
      ) : (
        <>
          <h2>Status</h2>
          <p>也许狗带了, 祝我一路顺风</p>
          <h2>Death Plan</h2>
          <div className="flex items-center justify-between py-4 pl-4 pr-5 leading-6">
            <div className="flex w-0 flex-1 items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-4 flex min-w-0 flex-1 gap-2">
                <p className="font-medium">death-plan.md</p>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <a
                href="/death-plan.md"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                download="death-plan.md"
              >
                Download
              </a>
            </div>
          </div>
          <iframe
            srcDoc={text}
            className="relative rounded-xl overflow-auto w-full h-60 border border-gray-100"
          ></iframe>
        </>
      )}
    </div>
  );
}

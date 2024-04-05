import { useEffect, useRef } from "react";
import "aplayer/dist/APlayer.min.css";
import APlayer from "aplayer";

export default function Player() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ap = new APlayer({
      container: container.current,
      fixed: true,
      autoplay: true,
      audio: [
        {
          name: "银の龙の背に乗って",
          artist: "中島みゆき",
          url: "https://cdn.tomcat.run/%E9%93%B6%E3%81%AE%E9%BE%99%E3%81%AE%E8%83%8C%E3%81%AB%E4%B9%97%E3%81%A3%E3%81%A6.flac",
          cover:
            "https://cdn.tomcat.run/%E9%8A%80%E3%81%AE%E9%BE%8D%E3%81%AE%E8%83%8C%E3%81%AB%E4%B9%97%E3%81%A3%E3%81%A6.webp",
        },
      ],
    });

    return () => {
      ap.destroy();
    };
  }, []);

  return <div ref={ container }></div>;
}

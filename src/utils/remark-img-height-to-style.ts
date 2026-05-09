export default function remarkImgHeightToStyle() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function walk(node: any) {
      if (!node || typeof node !== "object") return;

      if (
        node.type === "html" &&
        typeof node.value === "string" &&
        node.value.includes("<img")
      ) {
        node.value = node.value.replace(
          /<img\b([\s\S]*?)>/gi,
          (match: string, attrs: string) => {
            try {
              // Find height attribute (number or with unit)
              const heightRegex =
                /\sheight\s*=\s*(?:"|')?([0-9]+(?:px|%|em|rem)?)(?:"|')?/i;
              const heightMatch = attrs.match(heightRegex);
              if (!heightMatch) return `<img${attrs}>`;

              const heightValueRaw = heightMatch[1];

              // Normalize numeric values without unit to px
              const heightValue = /^(\d+)$/.test(heightValueRaw)
                ? `${heightValueRaw}px`
                : heightValueRaw;
              const customStyle = `max-height: ${heightValue};max-width: 100%;height: auto;display: inline;`;

              const href =
                attrs.match(/\ssrc\s*=\s*(?:"|')?([^"'\s]+)(?:"|')?/i)?.[1] ||
                "#";

              return `<a href="${href}" target="_blank" rel="noopener noreferrer"><img ${attrs} class="not-prose" style="${customStyle}"></a>`;
            } catch {
              // On error, return original match
              return match;
            }
          }
        );
      }

      // Recurse children
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child);
      }
    }

    walk(tree);
  };
}

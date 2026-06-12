import "../src/styles/reset.css";
import "../src/styles/variables.css";
import "../src/styles/index.css";
import "../src/styles/theme/button.css";
import "../src/styles/theme/badge.css";
import "../src/styles/theme/card.css";
import "../src/styles/theme/form.css";
import "../src/styles/theme/table.css";

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark",  value: "#1a1a1a" },
      ],
    },
  },
};

export default preview;

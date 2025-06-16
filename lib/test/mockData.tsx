interface UILibrary {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  image: string;
  tags: string[];
}

export const uiLibraries: UILibrary[] = [
  {
    id: "fluent",
    name: "Fluent UILIB",
    description:
      "Good ui library in style of fluent or windows 11 ui.",
    author: "d3wid",
    category: "Luau",
    image: "https://github.com/dawid-scripts/Fluent/raw/master/Assets/logodark.png#gh-dark-mode-only",
    tags: ["Best", "Minimalistic", "Ui", "Lib"],
  },
];

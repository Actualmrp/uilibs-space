export interface Library {
  name: string
  description: string
  about: string
  author: string
  authorBio: string
  website: string
  github: string
  preview: string
  gallery: string[]
  installation: string
}

export interface LibraryData {
  [key: string]: Library
}

export const libraryData: LibraryData = {
  "fluent": {
    name: "Fluent UILIB",
    description: "Good ui library in style of fluent or windows 11 ui.",
    author: "d3wid",
    authorBio: "Idk lol",
    website: "",
    github: "https://github.com/dawid-scripts/Fluent/",
    preview: "https://github.com/dawid-scripts/Fluent/raw/master/Assets/logodark.png#gh-dark-mode-only",
    gallery: [
      "https://images.guns.lol/47ped.png",
      "https://images.guns.lol/gGwIN.png",
      "https://images.guns.lol/z0WG4.png"
    ],
    installation: "npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge",
    
    about: `A comprehensive UI library that brings the modern Fluent Design System and Windows 11 aesthetics to your applications. Features a clean, minimalist interface with smooth animations, consistent spacing, and a cohesive design language. Perfect for developers looking to create applications with a professional, contemporary look and feel.
## ⚡ Features

- Modern design
- Many customization options
- Almost any UI Element you would ever need 
<br/>

## 🔌 Installation

You can load Fluent through a GitHub Release:

\`\`\`lua
local Fluent = loadstring(game:HttpGet("https://github.com/dawid-scripts/Fluent/releases/latest/download/main.lua"))()
\`\`\`

<br/>

## 📜 Usage

[Example Script](https://github.com/dawid-scripts/Fluent/blob/master/Example.lua)
<br/>

## Credits

- [richie0866/remote-spy](https://github.com/richie0866/remote-spy) - Assets for the UI, some of the code
- [violin-suzutsuki/LinoriaLib](https://github.com/violin-suzutsuki/LinoriaLib) - Code for most of the elements, save manager
- [7kayoh/Acrylic](https://github.com/7kayoh/Acrylic) - Porting richie0866's acrylic module to lua
- [Latte Softworks & Kotera](https://discord.gg/rMMByr4qas) - Bundler`,
  },
}
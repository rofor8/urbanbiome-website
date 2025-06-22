// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "images/uploads/sections",
      publicFolder: "public"
    }
  },
  search: {
    // Optional
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN,
      stopwordLanguages: ["eng"]
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100
  },
  schema: {
    collections: [
      {
        label: "Site Sections",
        name: "sections",
        path: "src/content/sections",
        format: "md",
        ui: {
          router: ({ document }) => {
            const filename = document._sys.filename.replace(/\.md$/, "");
            return `/admin/collections/sections/documents/${filename}`;
          }
        },
        fields: [
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true
          },
          {
            type: "number",
            label: "Order",
            name: "order"
          },
          {
            type: "string",
            label: "Navigation Title",
            name: "navTitle"
          },
          {
            type: "boolean",
            label: "Centered Layout",
            name: "centered"
          },
          {
            type: "rich-text",
            label: "Body Content",
            name: "body",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};

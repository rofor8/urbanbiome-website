import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "sections",
        label: "Page Sections",
        path: "src/content/sections",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Section Title",
            isTitle: true,
            required: true,
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
            required: true,
          },
          {
            type: "string",
            name: "navTitle",
            label: "Navigation Title (Optional)",
          },
          {
            type: "rich-text",
            name: "body",
            label: "Content",
            isBody: true,
          },
        ],
      },
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content/settings",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "string",
            name: "siteTitle",
            label: "Site Title",
          },
          {
            type: "object",
            name: "colors",
            label: "Color Scheme",
            fields: [
              {
                type: "string",
                name: "primary",
                label: "Primary Color",
                ui: {
                  component: "color",
                },
              },
              {
                type: "string",
                name: "secondary",
                label: "Secondary Color",
                ui: {
                  component: "color",
                },
              },
              {
                type: "string",
                name: "accent",
                label: "Accent Color",
                ui: {
                  component: "color",
                },
              },
              {
                type: "string",
                name: "background",
                label: "Background Color",
                ui: {
                  component: "color",
                },
              },
              {
                type: "string",
                name: "text",
                label: "Text Color",
                ui: {
                  component: "color",
                },
              },
            ],
          },
        ],
      },
    ],
  },
});

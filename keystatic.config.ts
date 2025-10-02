import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'rofor8/urbanbiome-website',
  },

  collections: {
    sections: collection({
      label: 'Page Sections',
      slugField: 'title',
      path: 'src/content/sections/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        order: fields.number({
          label: 'Display Order',
          description: 'Order in which this section appears on the page',
          validation: { isRequired: true },
        }),
        navTitle: fields.text({
          label: 'Navigation Title',
          description: 'Optional - different title for navigation menu',
        }),
        content: fields.markdoc({
          label: 'Content',
          description: 'The main content for this section',
        }),
      },
    }),
  },

  singletons: {
    settings: {
      label: 'Site Settings',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        siteTitle: fields.text({ label: 'Site Title' }),
        colors: fields.object({
          label: 'Color Scheme',
          fields: {
            primary: fields.text({
              label: 'Primary Color',
              description: 'Hex color code (e.g., #2c5f2d)',
            }),
            secondary: fields.text({
              label: 'Secondary Color',
              description: 'Hex color code',
            }),
            accent: fields.text({
              label: 'Accent Color',
              description: 'Hex color code',
            }),
            background: fields.text({
              label: 'Background Color',
              description: 'Hex color code',
            }),
            text: fields.text({
              label: 'Text Color',
              description: 'Hex color code',
            }),
          },
        }),
      },
    },
  },
});

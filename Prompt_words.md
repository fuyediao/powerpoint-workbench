I want to create a PowerPoint creation platform. The front-end will be built using Vue 3 + Vite + Tailwind v4, with the front-end code stored in the `frontend` folder, which will also contain a `src` folder. I also need i18n for multilingual support, prioritizing Simplified Chinese and English. Multilingual versions will be stored in .json files, with other languages ​​to be added later. Based on user-provided text materials, I'll use Google's Gemini 3 Pro and Nano Banana Pro models to create a richly illustrated PPT consisting of multiple pages of images. I also need to add Ollama and Comfy UI to understand and generate images. The settings should allow users to switch between using an API key and a local AI service. After users provide text materials, web URLs, or images in Markdown, Word, PDF, or other formats, the platform will break down the text content according to the desired number of pages in the PowerPoint presentation and generate individual PowerPoint pages. Each page can be redesigned with adjustments to the prompt, reference structure, and key points, while maintaining a consistent design style across all pages. After the user has confirmed the content of each page, the content is compiled into a single PDF file for download and use.

1. Specific Use Cases

Main Purpose: What scenarios is this tool primarily used for? For example, work reports, teaching materials, product demonstrations? It's used for PowerPoint creation, and the finished product is suitable for many scenarios. User Group: Is it mainly for your own use, or for multiple people in a team? For personal use.

2. Input/Output Details

Input Materials: How long is a typical document processed at one time? (e.g., 5 pages of Word/10 pages of PDF) It may have more pages.

What is the main material type? Markdown/Word/PDF? All are included.

Output Expectations: How many pages does a single PPT usually need? (e.g., 10-20 pages/20-50 pages) 10-30 pages.

Content Format per Page: Plain text/text/images/charts/data? Text/images

3. Usage Frequency and Cost Expectations

Usage Frequency: How often do you create PPTs? How many times per month? How many times per month.

Processing Volume: The range of PPT pages generated each time? 10-30 pages. In addition to uploading a document, a text pasting option should be added for users to upload documents. The PowerPoint slide selection allows you to choose from 1 to 50 slides, with a default of 10 slides. For the global design style, several default templates are available, including two types: a concise style and a detailed style. One style is suitable for external presentations, while the other focuses on showcasing text content in as much detail as possible. Users can also submit design requirements, which will be refined by an AI model and used as part of the generated image-based PowerPoint presentation. Each slide is generated using the Nano Banana Pro API or Comfy UI, so each slide in the page-by-page editing area allows users to upload images for reference or display, modify the text content refined in the previous steps, change the slide prompts, and generate the corresponding PPT page based on the global design requirements. The generated PPT pages can be clicked to enlarge and view. The default provided Prompt is suitable for generating images for multimodal large-scale models. Besides considering the above requirements, you also need to consider any boundary issues I haven't considered.
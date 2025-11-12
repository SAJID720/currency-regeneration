import { GoogleGenAI, Modality } from "@google/genai";
import { type BanknoteDetails } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

function buildPrompt(details: BanknoteDetails, isPreview: boolean = false): string {
  if (isPreview) {
    return `
      **Task:** Create a fast, low-fidelity preview sketch of a banknote.
      **Currency Name:** Khan
      **Instructions:** Focus ONLY on the main composition, colors, and placement of key elements. IGNORE all fine details, security features like microprinting, watermarks, UV ink, intaglio, etc. This is for a quick visual check.

      **Key Visual Elements:**
      - **Denomination & Symbol:** ${details.denomination} ${details.currencySymbol}
      - **Primary Color Palette:** ${details.mainColor}
      - **Central Motif:** ${details.centralMotif}
      - **Aspect Ratio:** ${details.width}mm wide by ${details.height}mm tall.

      **Output:** A flat, front-facing image of the banknote sketch.
    `;
  }

  const holographicPrompt = details.animatedHologram
    ? `Design a holographic strip or patch with a dynamic, multi-layered, and iridescent appearance that looks like it shifts color and texture when viewed from different angles. This effect should be based on the description: "${details.holographicElement}".`
    : `Design a static, metallic foil holographic strip or patch with a simple, flat, embossed appearance based on the description: "${details.holographicElement}". This should not appear to shift colors.`;

  const qualityPreamble = {
    'Standard': 'Create a clean, clear, and aesthetically pleasing design for a banknote for a fictional currency named "Khan".',
    'High Detail': 'Create a highly detailed, photorealistic, and aesthetically pleasing design for a banknote for a fictional currency named "Khan", focusing on intricate fine lines and complex security patterns.',
    'Ultra Realistic': 'Create a hyper-realistic, photorealistic, and aesthetically pleasing design for a banknote for a fictional currency named "Khan", with extreme attention to microscopic details. The image should simulate the unique texture of cotton-linen paper, the raised feel of intaglio ink, and subtle, realistic lighting, as if it were a real photograph of a brand new banknote.',
  }[details.printQuality] || 'Create a highly detailed, photorealistic, and aesthetically pleasing design for a banknote for a fictional currency named "Khan".';


  return `
    ${qualityPreamble}

    **Physical Characteristics:**
    - **Dimensions:** Design the banknote with an aspect ratio corresponding to a physical size of ${details.width}mm wide by ${details.height}mm tall.

    **Key Specifications:**
    - **Currency Name:** Khan
    - **Denomination:** ${details.denomination}. The currency symbol "${details.currencySymbol}" should be elegantly placed next to the denomination number. Apply a subtle embossing effect to this text to give it a slightly raised, tactile appearance.
    - **Serial Number:** Include a unique and stylized serial number on the banknote, following the format or example: "${details.serialNumber}". The serial number should be integrated into the design, often appearing in two locations, and rendered in a font that complements the overall security aesthetic.
    - **Primary Color Palette:** ${details.mainColor}. The colors should be rich and vibrant.
    - **Background Pattern:** The background of the banknote should feature intricate patterns based on this description: "${details.backgroundPattern}".
    - **Central Figure/Motif:** ${details.centralMotif}. This should be the main focal point, rendered with artistic detail.
    - **Supporting Symbols & Elements:** ${details.symbols}. These should be integrated elegantly into the background and borders.
    - **Issuing Authority:** The text "${details.issuingAuthority}" should be clearly visible, rendered in a font style similar to '${details.issuingAuthorityFont}'. Apply a subtle embossing effect to this text.
    - **Issuing Location:** The text "${details.issuingLocation}" should be subtly placed on the banknote, often in a smaller font near the issuing authority's name.
    - **Banknote Series:** Include the series designation "${details.banknoteSeries}" subtly on the banknote, often in a smaller font near the issuing authority's name or the edge of the design.
    - **Motto/Slogan:** Include the phrase "${details.motto}" in a stylish font similar to '${details.mottoFont}'. Apply a subtle embossing effect to this text.

    **Security Features:**
    - **Watermark:** Simulate a subtle watermark based on this description: "${details.watermark}".
    - **Microprinting:** Include extremely small text as described here: "${details.microprinting}".
    - **Holographic Element:** ${holographicPrompt}${details.foilEffect && details.foilEffect.trim() ? `\n    - **Foil Effect:** Apply a metallic foil effect as described: "${details.foilEffect}". This should appear as a distinct, slightly raised layer with a unique sheen, separate from regular metallic ink.` : ''}
    - **UV Reactive Ink:** Incorporate elements that are only visible under ultraviolet light, as described: "${details.uvInkElement}". The design should look normal under regular light but reveal these hidden features under UV.
    - **Intaglio Printing:** The final image should simulate the distinct, raised texture of intaglio printing in key areas. Describe where this effect is applied: "${details.intaglioPrinting}". This gives the banknote a tactile feel.

    **Design Requirements:**
    - **Edge Detail:** The edges and borders of the banknote should feature the following design: "${details.edgeDetail}".
    - **Metallic Glint Effect:** Simulate subtle, realistic light reflections and highlights on any metallic-looking parts of the design (like foil elements, metallic inks, or borders). The effect should be described as: "${details.metallicGlintEffect}". This will enhance the visual appeal and perceived value.
    - The overall design should feel official, prestigious, and secure.
    - Incorporate intricate patterns, guilloche lines, and other security-style graphics.
    - The layout must be balanced and visually appealing, with clear hierarchy of elements.
    - The final image should be a flat, front-facing view of a single banknote. Do not show shadows, perspective, or backgrounds.
  `;
}

export async function generateBanknoteImage(details: BanknoteDetails, isPreview: boolean = false): Promise<string> {
  const prompt = buildPrompt(details, isPreview);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('error_no_image_generated');

  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    if (error instanceof Error && (error.message === 'error_no_image_generated')) {
      throw error;
    }
    throw new Error("error_generation_failed");
  }
}
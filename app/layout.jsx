import "./globals.css";
import { Providers } from "./providers";
export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    title: { default: "PromptArc — AI Prompt Marketplace", template: "%s | PromptArc" },
    description: "Discover, create, and share high-quality prompts for ChatGPT, Claude, Gemini, Midjourney, and more.",
    openGraph: { title: "PromptArc", description: "Build better AI outcomes, together.", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "PromptArc" }] },
    twitter: { card: "summary_large_image", title: "PromptArc", description: "Build better AI outcomes, together.", images: ["/og.png"] },
    icons: {
        icon: "/favicon.svg",
        shortcut: "/favicon.svg",
    },
};
export default function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <body><Providers>{children}</Providers></body>
    </html>);
}

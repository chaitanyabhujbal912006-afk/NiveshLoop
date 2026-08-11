import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NiveshLoop — Learn Stock Market Investing",
    short_name: "NiveshLoop",
    description: "Learn Indian stock market investing with ₹1,00,000 simulated portfolio.",
    start_url: "/",
    display: "standalone",
    background_color: "#E9EFE7",
    theme_color: "#1E2A44",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

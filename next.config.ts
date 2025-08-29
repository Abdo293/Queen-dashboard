import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "lfgmzhboeybrgeybvfqs.supabase.co",
      "lfgmzhboeybrgeybvfqs.storage.supabase.co",
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

// import { AuthProvider } from "@/context/AuthContext";
// import { SubscriptionProvider } from "@/context/SubscriptionContext";
// import { Box } from "@mui/material";
// import TopbarAfter from "@/components/common/topbar/TopbarAfter";

// export default function AppLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <AuthProvider>
//       <SubscriptionProvider>
//         <TopbarAfter />
//         <Box
//           sx={{
//             minHeight: "100vh",
//             bgcolor: "background.default",
//             py: 3,
//           }}
//         >
//           {children}
//         </Box>
//       </SubscriptionProvider>
//     </AuthProvider>
//   );
// }

import type { Metadata } from "next";
import "../globals.css";
import Providers from "@/components/Providers";
import NextTopLoader from "nextjs-toploader";
import { Header } from "@/components/layout/Header";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";


export const metadata: Metadata = {
  title: "RemindCA | Compliance & Reminder Management",
  description:
    "Automated compliance task and reminder management platform for CA firms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] antialiased transition-colors duration-300">
        <NextTopLoader
          color="#29d"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          zIndex={1600}
          showAtBottom={false}
        />

        <Providers>
          <Header />

          {children}
        </Providers>
      </body>
    </html>
  );
}
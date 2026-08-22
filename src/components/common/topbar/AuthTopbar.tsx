"use client";

import React from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Link from "next/link";

const AuthTopbar: React.FC = () => {
  return (
    <Box
      sx={{
        height: 72,
        bgcolor: "background.paper",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, md: 6 },
      }}
    >
      {/* Left: Logo */}
      <MuiLink
        component={Link}
        href="/"
        sx={{
          display: "flex", alignItems: "center", gap: 1,
          textDecoration: "none", cursor: "pointer",
        }}
      >
        <CheckCircleOutlineIcon
          sx={{ color: "secondary.main", fontSize: 28 }}  // ✅ CHANGED: #2E9E5E green → secondary.main (Warm Gold)
        />
        <Typography
          variant="h6"
          sx={{ color: "primary.main", fontWeight: 600 }}  // ✅ CHANGED: #333 → primary.main (Deep Navy)
        >
          ReminderCA
        </Typography>
      </MuiLink>

      {/* Right: Login link */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary" }}               // ✅ CHANGED: #666 → text.secondary (theme token)
        >
          Already using Expiration Reminder?
        </Typography>
        <MuiLink
          component={Link}
          href="/login"
          sx={{
            color: "primary.main",                       // ✅ CHANGED: #2E9E5E green → primary.main (Deep Navy)
            fontWeight: 500,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },  // hover style unchanged
          }}
        >
          Login
        </MuiLink>
      </Box>
    </Box>
  );
};

export default AuthTopbar;
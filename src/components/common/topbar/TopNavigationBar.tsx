"use client";

import { useEffect, useState } from "react";
import {
  Tooltip,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import GroupIcon from "@mui/icons-material/Group";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { usePathname, useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../config/firebase";

import UserDropdown from "./UserDropdown";

const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Tasks", href: "/tasks" },
  { label: "Taskrules", href: "/task-definitions" },
  { label: "Reminders", href: "/reminders" },
  { label: "People", href: "/people" },
];

export default function TopNavigationBar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState("User");

  const [peopleAnchorEl, setPeopleAnchorEl] = useState<null | HTMLElement>(null);
  const openPeopleMenu = Boolean(peopleAnchorEl);

  const handlePeopleClick = (e: React.MouseEvent<HTMLElement>) =>
    setPeopleAnchorEl(e.currentTarget);
  const handlePeopleClose = () => setPeopleAnchorEl(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email?.split("@")[0] || "User");
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const peopleActive =
    pathname.startsWith("/people") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/staff");

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

        {/* ── Left ── */}
        <Stack direction="row" alignItems="center" spacing={2}>

          {/* Logo */}
          <Typography
            onClick={() => router.push("/dashboard")}
            sx={{
              cursor: "pointer",
              color: "secondary.main",          // ✅ CHANGED: "primary.main" (invisible on navy) → Warm Gold
              fontWeight: 800,
              fontSize: "1.5rem",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              lineHeight: 1,
              userSelect: "none",
              "&:hover": { opacity: 0.85 },
            }}
          >
            RemindCA
          </Typography>

          {/* Nav Items */}
          <Stack direction="row" spacing={2}>
            {menuItems.map((item) => {

              // ── People dropdown ──
              if (item.label === "People") {
                return (
                  <Box key={item.label}>
                    <Button
                      variant="text"
                      onClick={handlePeopleClick}
                      endIcon={<KeyboardArrowDownIcon />}
                      sx={{
                        color: peopleActive
                          ? "secondary.main"              // ✅ CHANGED: "primary.main" → Gold when active
                          : "rgba(255,255,255,0.85)",     // ✅ CHANGED: "text.primary" → white when inactive
                        fontWeight: 700,
                        bgcolor: peopleActive
                          ? "rgba(201,168,76,0.15)"       // ✅ CHANGED: green rgba → gold tint when active
                          : "transparent",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.08)", // ✅ CHANGED: green rgba → white tint on hover
                        },
                      }}
                    >
                      People
                    </Button>
                    <Menu
                      anchorEl={peopleAnchorEl}
                      open={openPeopleMenu}
                      onClose={handlePeopleClose}
                    >
                      <MenuItem
                        onClick={() => {
                          router.push("/clients");
                          handlePeopleClose();
                        }}
                      >
                        <ListItemIcon>
                          <PeopleIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Clients" />
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          router.push("/staff");
                          handlePeopleClose();
                        }}
                      >
                        <ListItemIcon>
                          <GroupIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Staff" />
                      </MenuItem>
                    </Menu>
                  </Box>
                );
              }

              // ── Regular nav items ──
              const active = pathname.startsWith(item.href);

              return (
                <Tooltip
                  key={item.label}
                  title={`Manage your ${item.label.toLowerCase()}`}
                >
                  <Button
                    variant="text"
                    onClick={() => router.push(item.href)}
                    sx={{
                      color: active
                        ? "secondary.main"              // ✅ CHANGED: "primary.main" → Gold when active
                        : "rgba(255,255,255,0.85)",     // ✅ CHANGED: "text.primary" → white when inactive
                      fontWeight: 700,
                      bgcolor: active
                        ? "rgba(201,168,76,0.15)"       // ✅ CHANGED: green rgba → gold tint when active
                        : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.08)", // ✅ CHANGED: green rgba → white tint on hover
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Tooltip>
              );
            })}
          </Stack>
        </Stack>

        {/* ── Right: User Profile ── */}
        <UserDropdown userName={userName} onLogout={handleLogout} />
      </Toolbar>
    </AppBar>
  );
}
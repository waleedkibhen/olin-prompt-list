# Olin Prompt List - Design System Guidelines

This document outlines the core design tokens, typography, and layout rules for the application. Always refer to these guidelines when creating or updating UI components to ensure a consistent, premium, and unified user experience.

## 1. Color Palette

### 1.1 Core Theme Colors (Dark Mode First)
- **Background**: `#09090B` (Level 0 Base / True Matte Black)
- **Surface**: `#18181B` (Level 1 Surface / Cards, sidebars, inputs)
- **Primary**: `#FFFFFF` (High-priority text, icons, actions)
- **Secondary**: `#A1A1AA` (Supporting text, metadata, help text)
- **Border / Frame**: `#27272A` (1px dividers and frames)
- **Hover State**: `#27272A`
- **Modal Borders / Dashed Empty Borders**: `#3F3F46`

### 1.2 Material Design (MD) Semantic Colors
*Note: Use these specific tokens when mapping dynamic states or maintaining MD compatibility.*

**Surface & Background**
- `surface`: `#131315`
- `surface-dim`: `#131315`
- `surface-bright`: `#39393b`
- `surface-container-lowest`: `#0e0e10`
- `surface-container-low`: `#1c1b1d`
- `surface-container`: `#201f22`
- `surface-container-high`: `#2a2a2c`
- `surface-container-highest`: `#353437`
- `surface-variant`: `#353437`
- `background`: `#131315`

**Foreground (Text & Icons)**
- `on-surface`: `#e5e1e4`
- `on-surface-variant`: `#c4c7c8`
- `inverse-surface`: `#e5e1e4`
- `inverse-on-surface`: `#313032`
- `on-background`: `#e5e1e4`

**Borders & Outlines**
- `outline`: `#8e9192`
- `outline-variant`: `#444748`
- `surface-tint`: `#c6c6c7`

**Primary Brand**
- `primary`: `#ffffff`
- `on-primary`: `#2f3131`
- `primary-container`: `#e2e2e2`
- `on-primary-container`: `#636565`
- `inverse-primary`: `#5d5f5f`

**Secondary Brand**
- `secondary`: `#c6c6cf`
- `on-secondary`: `#2f3037`
- `secondary-container`: `#45464e`
- `on-secondary-container`: `#b4b4bd`

**Tertiary Brand**
- `tertiary`: `#ffffff`
- `on-tertiary`: `#303037`
- `tertiary-container`: `#e3e1ea`
- `on-tertiary-container`: `#64646b`

**Fixed Variants**
- `primary-fixed`: `#e2e2e2` | `primary-fixed-dim`: `#c6c6c7`
- `on-primary-fixed`: `#1a1c1c` | `on-primary-fixed-variant`: `#454747`
- `secondary-fixed`: `#e2e1eb` | `secondary-fixed-dim`: `#c6c6cf`
- `on-secondary-fixed`: `#1a1b22` | `on-secondary-fixed-variant`: `#45464e`
- `tertiary-fixed`: `#e3e1ea` | `tertiary-fixed-dim`: `#c7c5ce`
- `on-tertiary-fixed`: `#1b1b21` | `on-tertiary-fixed-variant`: `#46464d`

**Feedback (Error)**
- `error`: `#ffb4ab`
- `on-error`: `#690005`
- `error-container`: `#93000a`
- `on-error-container`: `#ffdad6`

## 2. Typography

### 2.1 Font Families
- **Primary (Geist)**: Use for general UI elements, headlines, body text, and reading flow.
- **Monospace (JetBrains Mono)**: Use strictly for labels, metadata, prompt strings, analytics, code blocks, and category tags.

### 2.2 Typography Tokens
- **display-lg**: Font: `Geist` | Size: `48px` | Weight: `700` | Line Height: `1.1` | Letter Spacing: `-0.04em`
- **headline-md**: Font: `Geist` | Size: `24px` | Weight: `600` | Line Height: `1.2` | Letter Spacing: `-0.02em`
- **headline-sm**: Font: `Geist` | Size: `18px` | Weight: `600` | Line Height: `1.4`
- **body-md**: Font: `Geist` | Size: `14px` | Weight: `400` | Line Height: `1.6`
- **body-sm**: Font: `Geist` | Size: `12px` | Weight: `400` | Line Height: `1.5`
- **label-mono**: Font: `JetBrains Mono` | Size: `11px` | Weight: `500` | Line Height: `1.0` | Letter Spacing: `0.05em`
- **data-tabular**: Font: `JetBrains Mono` | Size: `13px` | Weight: `400` | Line Height: `1.0`

## 3. Spacing, Layout & Shapes

### 3.1 Dimensions & Grid
- **Unit Base**: `4px`
- **Gutter**: `16px`
- **Mobile Margin**: `16px`
- **Desktop Margin**: `32px`
- **Grid System**: 
  - `> 1200px` (Desktop): 12-column fixed grid
  - `768px - 1200px` (Tablet): 8-column grid
  - `< 768px` (Mobile): Single column grid

### 3.2 UI Components
- **Sidebar Width**: `280px` (Fixed)
- **Panel Slide-Out Width**: `440px`
- **Corner Radius**: `0px` (Strictly rectangular; **Do not use rounded corners unless explicitly specified**)
- **Border Weights**: 
  - Default: `1px`
  - Active/Focus: `2px`

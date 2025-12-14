# Pharmaceutical Manufacturing QC Application - Design Guidelines

## Design Approach

**Selected System**: Carbon Design System (IBM) - optimized for enterprise, data-heavy manufacturing applications
**Aesthetic Direction**: Modern enterprise with blue/purple gradient accents on clean white/gray foundations
**Core Principle**: Maximize information density while maintaining scanability and workflow efficiency

---

## Typography System

**Font Stack**: 'Inter' (primary), system-ui (fallback)

- **Headings**: 
  - H1: 2rem/bold - Page titles
  - H2: 1.5rem/semibold - Section headers
  - H3: 1.25rem/medium - Card titles, table headers
  
- **Body Text**: 
  - Default: 0.875rem/regular - Data tables, forms
  - Large: 1rem/regular - Dashboard metrics
  - Small: 0.75rem/medium - Labels, metadata

- **Monospace**: 'Fira Code' for batch numbers, IDs, timestamps

---

## Layout Framework

**Spacing Primitives**: Use Tailwind units of 1, 2, 4, 6, 8 (e.g., p-4, gap-6, mb-8)

**Structure**:
- Fixed sidebar: 16rem width (w-64)
- Main content: Full remaining width with max-w-none
- Content padding: px-8 py-6
- Card spacing: gap-6 for grids
- Section margins: mb-8 between major sections

**Grid Systems**:
- Dashboard cards: 3-column grid (lg:grid-cols-3, md:grid-cols-2, grid-cols-1)
- Status overview: 4-column for metrics (grid-cols-4)
- Forms: 2-column layouts (grid-cols-2) with full-width text areas

---

## Component Library

### Sidebar Navigation
- Logo/branding at top (h-16)
- Navigation groups with section headers (text-xs uppercase tracking-wide)
- Active state: Subtle left border (4px) + background fill
- Icons: 1.25rem with 0.75rem gap to text
- Collapsed state: Icons only (w-16 collapsed width)

### Dashboard Status Cards
- White background with subtle border
- Padding: p-6
- Header row: Metric title + trend indicator
- Large number display: 2.5rem/bold
- Supporting metrics: Grid of 2-3 sub-values
- Status indicator dot: Top-right corner (8px diameter)
- Hover: Subtle shadow elevation

### Data Tables
- Sticky header row with medium gray background
- Alternating row backgrounds (white/subtle gray)
- Cell padding: px-4 py-3
- Sortable columns: Arrow indicators
- Row actions: Right-aligned icon buttons
- Pagination: Bottom bar with page numbers + row count selector
- Row height: 3rem for scanability
- Filters: Top bar with dropdown selects + search input

### Forms & Batch Management
- Form sections: Bordered containers with section headers
- Input groups: Label above input (text-sm font-medium)
- Input height: 2.5rem (h-10)
- Multi-column forms: 2-col grid with gap-6
- Required fields: Red asterisk
- Validation states: Border color changes + inline error text
- Action buttons: Right-aligned button group
- Read-only fields: Lighter background with lock icon

### Workflow Tracking
- Horizontal stepper for linear workflows
- Step circles: 2.5rem diameter
- Connecting lines: 2px solid
- Active step: Larger circle with pulse animation
- Completed steps: Checkmark icon
- Step labels: Below circles (text-sm)
- Status badges: Pill-shaped with status colors
- Timeline view: Vertical line with event nodes (left-aligned)

### Charts & Visualizations
- Use Chart.js or Recharts libraries
- Chart containers: p-6 with white background
- Height: 20rem (h-80) for standard dashboards
- Legend: Top-right placement
- Tooltips: Dark background with white text
- Chart types: Line graphs for trends, bar charts for batch comparisons, donut charts for status distribution

### Modals & Overlays
- Modal backdrop: Semi-transparent dark overlay
- Modal content: max-w-2xl, rounded corners, white background
- Header: p-6 with title + close button
- Content: p-6 with divider
- Footer: p-6 with action buttons (right-aligned)
- Slide-out panels: Right-side drawer (w-96) for detail views

---

## Images

**No hero images** - This is an enterprise dashboard application focused on data and workflows.

**Functional Images**:
- Empty state illustrations: Centered in empty tables/dashboards (max-w-xs)
- Product/batch images: Thumbnail size (4rem square) in table rows
- User avatars: 2rem circle in header/activity feeds
- Status icons: 1rem in cards and badges

---

## Visual Hierarchy Principles

1. **Information Density**: Comfortable data density - avoid excessive whitespace in tables
2. **Scanability**: Use subtle backgrounds, borders, and spacing to create visual grouping
3. **Action Priority**: Primary actions (Submit, Approve) always prominent; secondary actions (Cancel, Back) subdued
4. **Status Communication**: Consistent use of status indicators across all components
5. **Focus Management**: Clear active/focus states for keyboard navigation
6. **Data Emphasis**: Numeric values and critical data points receive larger, bolder treatment
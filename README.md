# Knowledge Base & Help Center CMS

A comprehensive, full-stack Help Center and Knowledge Base built with Laravel, React, and Inertia.js. It features a beautiful, responsive public-facing documentation viewer and an advanced, secure Admin Panel with strict Role-Based Access Control (RBAC).

## 🚀 Tech Stack
* **Backend:** PHP 8.x, Laravel 11.x
* **Frontend:** React, Inertia.js
* **Styling:** Tailwind CSS, customized UI rendering
* **Authentication/Security:** Laravel Breeze, Spatie Laravel Permissions
* **Rich Text Editor:** Tiptap (Headless wrapper around ProseMirror)

## ✨ Core Features
* **Modern Public Viewer:** A highly responsive public Help Center with a dynamic collapsible sidebar, an automatic scroll-tracking Table of Contents, and instant search capabilities.
* **Block-based CMS Architecture:** Articles are built sequentially using distinct "Blocks" (Headings, Paragraphs, Rich Text, Images, Lists). This guarantees structured, cleanly-styled data.
* **Granular Role-Based Access Control (RBAC):** A closed registration system strictly controlled by Admins to ensure unauthorized users cannot compromise internal documentation.
* **Drag-and-Drop Reordering:** Easily sort Products, Sections, and Subsections using an intuitive drag-and-drop hierarchy.
* **Integrated Media Management:** Seamless image uploading embedded directly into the Rich Text Editor.

---

## 👥 User Roles & Permissions
The system runs on a strict internal hierarchy to prevent accidental deletions and secure sensitive data.
* **👑 Super Admin:** Has absolute control. Can access the User Management dashboard, invite new staff, and edit or delete any data across the entire platform.
* **📋 Manager:** The Editor-in-Chief. Can manage all content (Create, Edit, Reorder, Delete Products and Sections), but has NO access to the User Management dashboard.
* **✍️ Writer:** The Content Creator. Can safely write and update text inside existing articles. They are actively prevented from deleting major structural categories (Products/Sections) or accessing User profiles to prevent catastrophic mistakes.

---

## 🛠 Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   composer install
   npm install
   ```

2. **Environment Setup:**
   Copy the example `.env` file and generate an application key.
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Note: Ensure you update your database credentials in the `.env` file and set `CACHE_STORE=file`.*

3. **Migrate and Seed the Database:**
   ```bash
   php artisan migrate:fresh --seed
   ```
   *This command will build the exact database schema and automatically generate the Spatie Roles & Permissions, as well as three default testing accounts: `admin@example.com`, `manager@example.com`, and `writer@example.com` (password: `password`).*

4. **Compile Frontend & Start Local Server:**
   ```bash
   npm run dev
   php artisan serve
   ```

---

## 📚 How to Use the Admin Panel

### 1. Provisioning Accounts
Only **Super Admins** can invite staff. Public registration is intentionally disabled. 
Navigate to the **USERS** tab on the sidebar to create an account, assign a role (Manager or Writer), and set an initial password.

### 2. Structuring Your Documentation
The Knowledge Base follows a strict 3-tier hierarchy:
* **Products:** The top-level category (e.g., *IT Help Desk*, *HR Portal*).
* **Sections:** The broad topics inside a product (e.g., *Getting Started*, *Troubleshooting*).
* **Subsections (Articles):** The actual, readable pages inside a section.

### 3. Writing Content (The Block Editor)
Clicking into a Subsection opens the actual Content Editor. You can add distinct blocks to your page:
* **Rich Text Blocks:** Use this for 90% of your writing. It includes a full toolbar for Bold, Links, Bullet Points, and Inline Images. 
* **Dedicated Blocks:** You can intentionally inject standalone Image Blocks, List Blocks, or Heading Blocks to force specific, unbreakable formatting.

**Rich Text Editor Tip:** 
When typing in the Rich Text Editor, pressing **`Enter`** creates an entirely new text block (a visual paragraph jump). To drop to the immediate next line without a large gap, hold **`Shift+Enter`**.

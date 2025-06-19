# Interactive Canvas Application

This project is an interactive web application designed to provide a dynamic canvas where users can create, organize, and interact with digital "cards" or notes. It functions as a simple, intuitive digital whiteboard, allowing for flexible content creation and arrangement.

## Product Vision

The core vision behind this application is to offer a seamless and adaptable space for brainstorming, note-taking, or simple content organization. It aims to provide an experience akin to a physical whiteboard or sticky notes, but with the added benefits of digital flexibility, responsiveness, and persistence. The design prioritizes user-friendly interactions and a clean, uncluttered interface.

## Tech Stack

The application is built using a modern and efficient web development stack:

*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and developer experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **Vite**: A next-generation frontend tooling that provides an extremely fast development experience and optimized build process.
*   **Lucide React**: A collection of beautiful, pixel-perfect icons, integrated for potential future use or current branding (though not extensively used in the core card component itself).

## Product Scope & Key Features

The application focuses on providing a core set of features for an interactive canvas experience:

1.  **Dynamic Canvas Management**:
    *   **Adaptive Viewport Modes**: The canvas intelligently switches between a `fixed` mode (scaling to fit the available viewport while maintaining a 16:9 aspect ratio) and a `scrollable` mode (maintaining 100% scale with overflow scrolling) to ensure optimal viewing and interaction across different screen sizes.
    *   **Quadrant Dividers**: Visual guides on the canvas help users organize content into logical sections.
    *   **New Card Creation**: Users can double-click on any empty space within the canvas to instantly create a new, editable card.

2.  **Interactive & Editable Cards**:
    *   **Drag-and-Drop Functionality**: Cards can be freely dragged and repositioned anywhere on the canvas.
    *   **Z-Index Management**: Interacting with a card (dragging or editing) automatically brings it to the forefront, ensuring it's always visible and accessible.
    *   **Content Editing**: Double-clicking an existing card allows users to enter an edit mode to modify its text content.
    *   **Dynamic Sizing**: Cards automatically adjust their width and height based on the length of their content, optimizing space and readability.
    *   **Character Limit**: A built-in character limit helps keep card content concise, with a visual counter appearing when editing.
    *   **Intuitive Editing Controls**: Edits can be saved by clicking outside the card or pressing `Enter`, and canceled by pressing `Escape`.
    *   **Position Preservation**: Card positions are maintained seamlessly when the canvas switches between `fixed` and `scrollable` modes, ensuring a consistent user experience.

## Mental Model & Code Structure

The application's architecture is designed around a clear separation of concerns:

*   **`App.tsx`**: The main entry point, responsible for rendering the `Canvas` component.
*   **`Canvas.tsx`**: Manages the overall canvas state, including viewport mode, canvas scale, and the collection of cards. It handles canvas-level interactions like double-clicking to create new cards and orchestrates the rendering of individual `Card` components. It also contains the logic for adapting the canvas size and mode based on the viewport.
*   **`Card.tsx`**: Represents an individual interactive note. It encapsulates its own state for position, dragging, and editing. It handles user interactions specific to a card (drag, double-click, content editing) and communicates changes back to the `Canvas` component via props. The dynamic sizing logic for cards based on content length is also contained here.

The use of React hooks (`useState`, `useEffect`, `useRef`) is central to managing component state and side effects, such as handling window resizing for canvas scaling and managing global mouse events for dragging. Tailwind CSS is used for all styling, promoting rapid UI development and consistency.

## Getting Started

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## Usage

- **Create a new card**: Double-click on any empty space within the canvas
- **Edit a card**: Double-click on an existing card to enter edit mode
- **Move a card**: Click and drag any card to reposition it
- **Save edits**: Press `Enter` or click outside the card
- **Cancel edits**: Press `Escape` while editing

The canvas will automatically adapt to your screen size, switching between scaled and scrollable modes as needed.

# Background
This app was created as my second vibe coded project with [Bolt](https://bolt.new/) and it ultimately arrived at quite an impressive array of working client-side interactions that even worked smoothly on mobile.

![image](https://github.com/user-attachments/assets/c4015ef2-a364-47d3-89b8-bcf8951f562b)

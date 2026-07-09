import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import About from "./pages/About";
import { ThemeProvider } from "./lib/theme-provider";

function App() {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Routes>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;

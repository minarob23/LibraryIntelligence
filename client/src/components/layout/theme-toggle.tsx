import { useTheme } from "@/lib/hooks/use-theme";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center">
      <Sun className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-4 w-4 ml-2 text-gray-500 dark:text-gray-400" />
    </div>
  );
};

export default ThemeToggle;

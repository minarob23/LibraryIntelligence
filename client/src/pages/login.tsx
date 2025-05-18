import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/lib/hooks/use-theme';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address with @ symbol"
      });
      return;
    }

    // Check default password
    if (password === '123') {
      toast({
        title: "Success!",
        description: "Logged in successfully",
        className: "bg-green-500 text-white",
        duration: 3000
      });
      onLogin();
      const restore = await fetch('/api/restore-database', { method: 'POST' });
      if (restore.ok) {
        toast({
          title: "Data Restored",
          description: "System data has been restored successfully",
          className: "bg-green-500 text-white",
          duration: 3000
        });
        setTimeout(() => setLocation('/dashboard'), 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to restore system data"
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid email or password"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="hover:bg-accent"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      <Card className="w-[400px] shadow-lg animate-fade-up">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
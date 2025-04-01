import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  // If already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto py-10 flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1 w-full max-w-md">
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm setActiveTab={setActiveTab} />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex-1 w-full text-center md:text-left">
        <h1 className="text-4xl font-bold mb-4">National Parks ELO Ranking</h1>
        <p className="text-xl mb-6">
          Vote on your favorite national parks and help create the ultimate ranking!
        </p>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mt-1 flex-shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-lg">Create an account</h3>
              <p>Sign up to track your votes and personalize your experience</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mt-1 flex-shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-lg">Vote on matchups</h3>
              <p>Choose between head-to-head national park battles</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mt-1 flex-shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-lg">View rankings</h3>
              <p>See the most beloved national parks based on everyone's votes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  
  const form = useForm({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data);
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { registerMutation } = useAuth();
  
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Register to start voting on national parks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => setActiveTab("login")}>
          Already have an account? Sign in
        </Button>
      </CardFooter>
    </Card>
  );
}
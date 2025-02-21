"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import * as React from "react"
import {
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@radix-ui/react-separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { fetchUserProfile, updateUserProfile } from "@/lib/api"

const data = {
  nav: [
    { name: "Notifications", icon: Bell },
    { name: "Navigation", icon: Menu },
    { name: "Home", icon: Home },
    { name: "Appearance", icon: Paintbrush },
    { name: "Messages & media", icon: MessageCircle },
    { name: "Language & region", icon: Globe },
    { name: "Accessibility", icon: Keyboard },
    { name: "Mark as read", icon: Check },
    { name: "Audio & video", icon: Video },
    { name: "Connected accounts", icon: Link },
    { name: "Privacy & visibility", icon: Lock },
    { name: "Advanced", icon: Settings },
  ],
}

export function SettingsDialog() {
  const [open, setOpen] = React.useState(false)

  return (
    (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent
        className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild isActive={item.name === "Messages & media"}>
                          <a href="#">
                            <item.icon />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header
              className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Profile</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                  </p>
                </div>
                <Separator />
              </div>
              <ProfileForm />
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-video max-w-3xl rounded-xl bg-muted/50" />
              ))}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>)
  );
}

const defaultValues = {
  bio: "I own a computer.",
  urls: [
    { value: "https://shadcn.com" },
    { value: "http://twitter.com/shadcn" },
  ],
};

// Schema for form validation
const profileFormSchema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  bio: z.string().max(160).min(4).optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  urls: z.array(z.object({ value: z.string().url() })).optional(),
});

export function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const form = useForm({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
          username: "",
          email: "",
          bio: "",
          phone: "",
          country: "",
          urls: [{ value: "" }]
      },
      mode: "onChange",
  });

  const { fields, append } = useFieldArray({
      name: "urls",
      control: form.control,
  });

  useEffect(() => {
      async function fetchData() {
          try {
              const user = await fetchUserProfile();
              setUserData(user);
              form.reset({
                  username: `${user.first_name} ${user.last_name}`.trim(),
                  email: user.email,
                  bio: user.bio || "",
                  phone: user.phone_country_code ? `${user.phone_country_code} ${user.phone_number}` : "",
                  country: user.country || "",
                  urls: user.urls ? user.urls.map((url) => ({ value: url })) : [{ value: "" }],
              });
          } catch (err) {
              console.error("Error fetching user data:", err);
              setError(err.message);
          } finally {
              setLoading(false);
          }
      }

      fetchData();
  }, [form]);

  const onSubmit = async (data) => {
      try {
          setError("");
          const updatedData = {
              first_name: data.username.split(" ")[0] || "",
              last_name: data.username.split(" ").slice(1).join(" ") || "",
              email: data.email,
              bio: data.bio,
              phone_number: data.phone.split(" ").slice(1).join(" ") || "",
              phone_country_code: data.phone.split(" ")[0] || "",
              country: data.country,
              urls: data.urls.map((url) => url.value),
          };

          await updateUserProfile(userData.id, updatedData);
          alert("Profile updated successfully!");
      } catch (err) {
          console.error("Error updating profile:", err);
          setError(err.message);
      }
  };

  if (loading) return <p>Loading...</p>;

  return (
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
              {error && <p className="text-red-500">{error}</p>}
              
              <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                              <Input placeholder="Your Name" {...field} />
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
                              <Input type="email" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                              <Textarea placeholder="Tell us a bit about yourself" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                              <Input type="text" placeholder="+33 0695670877" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                              <Input type="text" placeholder="Enter your country" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <div>
                  {fields.map((field, index) => (
                      <FormField
                          control={form.control}
                          key={field.id}
                          name={`urls.${index}.value`}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel className={cn(index !== 0 && "sr-only")}>URLs</FormLabel>
                                  <FormControl>
                                      <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                      Add URL
                  </Button>
              </div>
              <Button type="submit">Update Profile</Button>
          </form>
      </Form>
  );
}
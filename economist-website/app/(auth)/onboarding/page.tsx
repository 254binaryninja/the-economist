"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { User, Briefcase, GraduationCap } from "lucide-react";
import { useOnboarding } from "@/hooks/onboarding/useOnboarding";

export default function OnboardingForm() {
  const { form, onSubmit, userName } = useOnboarding();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to The Economist AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's personalize your experience
          </p>
        </div>

        {/* Form Card */}
        <div className=" p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* User Name Field */}
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-2 text-foreground font-medium">
                      <User className="w-4 h-4" />
                      User Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`e.g , ${userName || "John Doe"}`}
                        {...field}
                        className="h-12 px-4 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-sm">
                      This will be displayed on your profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Occupation Field */}
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="flex items-center gap-2 text-foreground font-medium">
                      <Briefcase className="w-4 h-4" />
                      Occupation
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Economist, Financial Analyst, Student"
                        {...field}
                        className="h-12 px-4 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-sm">
                      Help us personalize your content and tools
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Student Checkbox */}
              <FormField
                control={form.control}
                name="student"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-start space-x-3 p-4 rounded-lg border border-border/50 bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <div className="space-y-2 leading-none">
                        <FormLabel className="flex items-center gap-2 text-foreground font-medium cursor-pointer">
                          <GraduationCap className="w-4 h-4" />I am currently a
                          student
                        </FormLabel>
                        <FormDescription className="text-muted-foreground text-sm">
                          Get access to educational resources, student
                          discounts, and academic tools
                        </FormDescription>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Creating Your Profile...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <span className="text-primary hover:underline cursor-pointer">
              terms of service
            </span>{" "}
            and{" "}
            <span className="text-primary hover:underline cursor-pointer">
              privacy policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Save } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useUserStore } from "@/store/UserStore";
import ThemeToggle from "../providers/ThemeToggle";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { usePreferences } from "@/hooks/preferences/usePreference";

export default function Preferences() {
  const { theme } = useTheme();
  const { verbosity, style, id } = useUserStore();
  const {
    verbosityState,
    setVerbosityState,
    styleState,
    setStyleState,
    isLoading,
    isSaving,
    loadData,
    handleSave,
  } = usePreferences();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update local state when store values change
  useEffect(() => {
    setVerbosityState(parseFloat(verbosity ?? "0.2") || 0.2);
    setStyleState(parseInt(style ?? "33", 10) || 33);
  }, [verbosity, style]);
  return (
    <Dialog>
      <div className="max-w-md w-full p-0">
        <div className="relative p-2">
          {/* Theme Section */}
          <div className="mb-4">
            <div className="font-semibold">Theme</div>
            <div className="text-sm text-gray-500">
              Edit your platform theme.
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Label htmlFor="theme">{theme}</Label>
            </div>
          </div>
          {/* Language Section */}
          <div className="mb-4">
            <div className="font-semibold">Language</div>
            <select className="mt-1 block w-full border rounded px-2 py-1 text-sm">
              <option>us English</option>
            </select>
            <div className="text-xs text-gray-400 mt-1">
              More languages are coming soon.
            </div>
          </div>
          {/* Learning Preferences Section */}
          <div className="mb-4">
            <div className="font-semibold mb-2">Learning Preferences</div>
            {/* Verbosity Slider */}
            <div className="mb-3">
              <div className="flex justify-between text-sm">
                <span>Verbosity</span>
                <span>
                  Less Creative&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; More
                  Creative
                </span>
              </div>{" "}
              <Slider
                min={0.0}
                max={1.0}
                step={0.01}
                value={[verbosityState]}
                onValueChange={(values) => {
                  if (typeof values[0] === "number")
                    setVerbosityState(values[0]);
                }}
                className="w-full mt-1"
              />
            </div>
            {/* Style Slider */}
            <div className="mb-3">
              <div className="flex justify-between text-sm">
                <span>Style</span>
                <span>
                  Bullet Points &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Paragraphs
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                value={[styleState]}
                onValueChange={(values) => {
                  if (typeof values[0] === "number") setStyleState(values[0]);
                }}
                className="w-full mt-1"
              />
            </div>
            {/*    /!* Other Details Textarea *!/*/}
            {/*    <div className="mb-3">*/}
            {/*        <div className="text-sm mb-1">Prompt Template</div>*/}
            {/*        <Textarea*/}
            {/*            className="w-full border rounded px-2 py-1 text-sm"*/}
            {/*            rows={3}*/}
            {/*            value={promptTemplate}*/}
            {/*            onChange={(e) => setPromptTemplate(e.target.value)}*/}
            {/*            placeholder="Please provide any instructions on how you want Campus Connect Assistant to teach you."*/}
            {/*        />*/}
            {/*    </div>*/}
          </div>
          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading || !id}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : isLoading ? "Loading..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Wand2, Send, Save, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const CreateNewsletter = () => {
  const [title, setTitle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI content generation
    setTimeout(() => {
      setContent(`# ${title || "AI-Generated Newsletter"}

${aiPrompt}

## Introduction

Welcome to this week's newsletter! Based on your prompt "${aiPrompt}", here's what we're exploring today.

## Main Content

[AI-generated content would appear here based on your prompt. This is a simulation of how the AI would help you create engaging newsletter content.]

## Key Takeaways

- Point 1: Insights derived from your topic
- Point 2: Actionable advice for your readers  
- Point 3: Future trends to watch

## What's Next?

Stay tuned for next week's edition where we'll dive deeper into related topics.

---

*This content was generated with AI assistance and can be fully customized to match your voice and style.*`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Create Newsletter</h1>
              <p className="text-muted-foreground">Use AI to brainstorm and create engaging content</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - AI Assistant */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-accent" />
                  AI Writing Assistant
                </CardTitle>
                <CardDescription>
                  Describe your newsletter topic and let AI help you brainstorm content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Newsletter Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 'Weekly Tech Insights'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt">What should this newsletter be about?</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., 'Latest AI developments in creative industries, focusing on how writers and designers can leverage new tools...'"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleAIGenerate} 
                  disabled={!aiPrompt.trim() || isGenerating}
                  className="w-full group"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Brainstorm with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Newsletter Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Premium Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Require subscription to read full content
                    </p>
                  </div>
                  <Switch
                    checked={isPremium}
                    onCheckedChange={setIsPremium}
                  />
                </div>

                {isPremium && (
                  <Badge className="bg-gradient-coral text-pure-white">
                    Premium Newsletter
                  </Badge>
                )}

                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger>
                      <SelectValue placeholder="When to send this newsletter?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Send immediately</SelectItem>
                      <SelectItem value="daily">Daily schedule</SelectItem>
                      <SelectItem value="weekly">Weekly schedule</SelectItem>
                      <SelectItem value="monthly">Monthly schedule</SelectItem>
                      <SelectItem value="custom">Custom date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {schedule === "custom" && (
                  <div className="space-y-2">
                    <Label>Custom Date & Time</Label>
                    <Input type="datetime-local" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content Editor */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Newsletter Content
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Auto-save enabled</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  Edit your newsletter content below. You can modify AI-generated content or write from scratch.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Start writing your newsletter content here, or use the AI assistant to generate content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={25}
                    className="font-mono text-sm resize-none"
                  />
                  
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{content.length} characters</span>
                    <span>~{Math.ceil(content.split(' ').length / 200)} min read</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Section */}
        {content && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how your newsletter will look to subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateNewsletter;
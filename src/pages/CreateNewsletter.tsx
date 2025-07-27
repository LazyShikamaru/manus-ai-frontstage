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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Wand2, Send, Save, CalendarIcon, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const CreateNewsletter = () => {
  const [title, setTitle] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [customDate, setCustomDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [promptError, setPromptError] = useState("");

  const validateFields = () => {
    let hasErrors = false;
    
    if (!title.trim()) {
      setTitleError("Newsletter title is required");
      hasErrors = true;
    } else if (title.length > 100) {
      setTitleError("Title must be less than 100 characters");
      hasErrors = true;
    } else {
      setTitleError("");
    }
    
    if (!aiPrompt.trim()) {
      setPromptError("Please describe what your newsletter should be about");
      hasErrors = true;
    } else if (aiPrompt.length > 500) {
      setPromptError("Description must be less than 500 characters");
      hasErrors = true;
    } else {
      setPromptError("");
    }
    
    return !hasErrors;
  };

  const handleAIGenerate = async () => {
    if (!validateFields()) return;
    
    setIsGenerating(true);
    
    // Mock AI responses based on different prompts
    const mockResponses = [
      `# ${title}

Based on your request about "${aiPrompt}", here's a comprehensive newsletter:

## 🚀 Key Insights

The landscape of ${aiPrompt.split(' ')[0]} is rapidly evolving. Recent developments show promising trends that creators and entrepreneurs should watch closely.

## 💡 What This Means for You

Here are three actionable takeaways:

1. **Embrace Change**: Stay adaptable as new tools emerge
2. **Focus on Value**: Quality content remains king
3. **Build Community**: Authentic connections drive growth

## 📈 Looking Ahead

The next quarter promises exciting developments. Keep experimenting and stay curious!

---
*Generated with AI assistance • Ready to customize*`,

      `# ${title}

Your topic "${aiPrompt}" is fascinating! Here's what I've brainstormed:

## 🎯 The Big Picture

Understanding ${aiPrompt} requires looking at multiple angles. Let's break down the most important aspects.

## 🔥 Trending Now

- Emerging patterns in the industry
- Tools that are changing the game  
- Opportunities for early adopters

## 💪 Action Steps

1. Start small with proven strategies
2. Test different approaches
3. Scale what works best

Ready to dive deeper? Let's make this newsletter shine!

---
*AI-powered content • Edit as needed*`
    ];
    
    // Simulate AI processing time
    setTimeout(() => {
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setContent(randomResponse);
      setIsGenerating(false);
      
      toast({
        title: "Content Generated!",
        description: "AI has created your newsletter content. Feel free to edit and customize it.",
        duration: 3000,
      });
    }, 2000);
  };

  const handleSaveDraft = async () => {
    if (!validateFields()) return;
    
    setIsSaving(true);
    
    // Simulate save operation
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Draft Saved",
        description: "Your newsletter has been saved successfully.",
        duration: 3000,
      });
    }, 1000);
  };

  const handlePublish = async () => {
    if (!validateFields() || !content.trim()) {
      toast({
        title: "Cannot Publish",
        description: "Please ensure all fields are filled and content is generated.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsPublishing(true);
    
    // Simulate publish operation
    setTimeout(() => {
      setIsPublishing(false);
      toast({
        title: "Newsletter Published!",
        description: "Your newsletter has been sent to all subscribers.",
        duration: 3000,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div>
              <h1 className="font-inter text-2xl font-bold text-foreground">Create Newsletter</h1>
              <p className="text-muted-foreground font-inter">Use AI to brainstorm and create engaging content</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="min-w-[120px] hover:scale-105 transition-all duration-300"
              aria-label="Save newsletter as draft"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="min-w-[120px] bg-electric-purple hover:bg-electric-purple/90 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-electric-purple/25"
              aria-label="Publish newsletter to subscribers"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  🚀 Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - AI Assistant */}
          <div className="xl:col-span-1 space-y-6 order-2 xl:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-inter">
                  <Sparkles className="h-5 w-5 mr-2 text-electric-purple animate-pulse" />
                  AI Writing Assistant
                </CardTitle>
                <CardDescription className="font-inter">
                  Describe your newsletter topic and let AI help you brainstorm content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-inter font-medium">Newsletter Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 'Weekly Tech Insights'"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (e.target.value.trim()) setTitleError("");
                    }}
                    className={`font-inter ${titleError ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {titleError && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {titleError}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground font-inter">
                    {title.length}/100 characters
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="font-inter font-medium">What should this newsletter be about? *</Label>
                  <Textarea
                    id="prompt"
                    placeholder="e.g., 'Latest AI developments in creative industries, focusing on how writers and designers can leverage new tools...'"
                    value={aiPrompt}
                    onChange={(e) => {
                      setAiPrompt(e.target.value);
                      if (e.target.value.trim()) setPromptError("");
                    }}
                    rows={4}
                    className={`font-inter resize-both min-h-[100px] max-h-[300px] transition-all duration-300 ${promptError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'focus:ring-electric-purple/20'}`}
                    aria-label="Newsletter topic description"
                  />
                  {promptError && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {promptError}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground font-inter">
                    {aiPrompt.length}/500 characters
                  </div>
                </div>

                <Button 
                  onClick={handleAIGenerate} 
                  disabled={!aiPrompt.trim() || !title.trim() || isGenerating}
                  className="w-full group bg-electric-purple hover:bg-electric-purple/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Generate newsletter content using AI"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      <span className="animate-pulse">AI is thinking...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 group-hover:rotate-12 group-hover:animate-pulse transition-all duration-300" />
                      ✨ Brainstorm with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Newsletter Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-inter">Newsletter Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`p-4 rounded-lg border transition-all duration-300 ${isPremium ? 'border-electric-purple bg-electric-purple/5 shadow-md' : 'border-border bg-card/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium font-inter flex items-center gap-2">
                        Premium Content
                        {isPremium && <span className="text-xs bg-electric-purple text-white px-2 py-0.5 rounded-full animate-pulse">PRO</span>}
                      </Label>
                      <p className="text-sm text-muted-foreground font-inter">
                        Require subscription to read full content
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={isPremium}
                        onCheckedChange={setIsPremium}
                        className="data-[state=checked]:bg-electric-purple transition-all duration-300 hover:scale-105"
                        aria-label="Toggle premium content setting"
                      />
                      <span className={`text-sm font-medium transition-all duration-300 ${isPremium ? 'text-electric-purple animate-fade-in' : 'text-muted-foreground'}`}>
                        {isPremium ? '✨ Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {isPremium && (
                  <Badge className="bg-electric-purple text-white hover:bg-electric-purple/90 transition-all duration-300 hover:scale-105">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Premium Newsletter
                  </Badge>
                )}

                <div className="space-y-2">
                  <Label className="font-inter font-medium">Schedule</Label>
                  <Select value={schedule} onValueChange={setSchedule}>
                    <SelectTrigger className="font-inter">
                      <SelectValue placeholder="When to send this newsletter?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Send immediately</SelectItem>
                      <SelectItem value="daily">Daily schedule</SelectItem>
                      <SelectItem value="weekly">Weekly schedule</SelectItem>
                      <SelectItem value="monthly">Monthly schedule</SelectItem>
                      <SelectItem value="custom">Custom date & time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {schedule === "custom" && (
                  <div className="space-y-2">
                    <Label className="font-inter font-medium">Select Date & Time</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal font-inter ${!customDate && "text-muted-foreground"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customDate ? format(customDate, "PPP 'at' p") : <span>Pick a date and time</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customDate}
                          onSelect={setCustomDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                        <div className="p-3 border-t">
                          <Label className="text-sm font-medium">Time</Label>
                          <Input 
                            type="time" 
                            className="mt-1"
                            onChange={(e) => {
                              if (customDate && e.target.value) {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(customDate);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                setCustomDate(newDate);
                              }
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Content Editor */}
          <div className="xl:col-span-2 min-h-0 order-1 xl:order-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-inter">
                  Newsletter Content
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-inter">Auto-save enabled</span>
                  </div>
                </CardTitle>
                <CardDescription className="font-inter">
                  Edit your newsletter content below. You can modify AI-generated content or write from scratch.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div className="space-y-4 flex-1 flex flex-col">
                  <Textarea
                    placeholder="Start writing your newsletter content here, or use the AI assistant to generate content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={20}
                    className="font-inter text-sm resize-both min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] flex-1 transition-all duration-300 focus:ring-2 focus:ring-electric-purple/20"
                    aria-label="Newsletter content editor"
                  />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-muted-foreground font-inter">
                    <div className="flex gap-4">
                      <span>{content.length} characters</span>
                      <span>~{Math.ceil(content.split(' ').filter(word => word.length > 0).length / 200)} min read</span>
                    </div>
                    <div className="text-xs">
                      Use Markdown for formatting: **bold**, *italic*, # headers
                    </div>
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
              <CardTitle className="font-inter">Preview</CardTitle>
              <CardDescription className="font-inter">
                See how your newsletter will look to subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none font-inter">
                <div className="whitespace-pre-wrap break-words">{content}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateNewsletter;
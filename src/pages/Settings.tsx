import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, CreditCard, Bell, Shield, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "Sarah Chen",
    email: "sarah@example.com",
    bio: "AI researcher and creative writing enthusiast passionate about the intersection of technology and creativity.",
    website: "https://sarahchen.com",
    avatar: "/placeholder-avatar.jpg"
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    marketingEmails: false,
    newsletterPerformance: true,
    newSubscribers: true
  });

  const handleProfileUpdate = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (setting: string) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting as keyof typeof prev] }));
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
              <h1 className="font-serif text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your profile information and public details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="text-lg">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Photo
                </Button>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell your audience about yourself..."
                value={profile.bio}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={profile.website}
                onChange={(e) => handleProfileUpdate('website', e.target.value)}
              />
            </div>

            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription
              </div>
              <Badge className="bg-gradient-coral text-pure-white">Creator Pro</Badge>
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <div>
                <h3 className="font-semibold">Creator Pro Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Unlimited newsletters and AI generation
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold">$29/month</div>
                <div className="text-sm text-muted-foreground">Next billing: Apr 15, 2024</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
              <Button variant="outline">Change Plan</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Email Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Important updates about your account and newsletters
                </p>
              </div>
              <Switch
                checked={notifications.emailUpdates}
                onCheckedChange={() => handleNotificationToggle('emailUpdates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Tips, feature updates, and promotional content
                </p>
              </div>
              <Switch
                checked={notifications.marketingEmails}
                onCheckedChange={() => handleNotificationToggle('marketingEmails')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Newsletter Performance</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly reports on your newsletter analytics
                </p>
              </div>
              <Switch
                checked={notifications.newsletterPerformance}
                onCheckedChange={() => handleNotificationToggle('newsletterPerformance')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">New Subscribers</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone subscribes to your newsletter
                </p>
              </div>
              <Switch
                checked={notifications.newSubscribers}
                onCheckedChange={() => handleNotificationToggle('newSubscribers')}
              />
            </div>

            <Button>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div>
                <h3 className="font-semibold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
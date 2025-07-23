import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  Settings, 
  BarChart3,
  Calendar,
  Edit,
  Eye,
  Trash2,
  Loader2,
  Menu
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  { title: "My Newsletters", url: "/dashboard", icon: FileText },
  { title: "Create", url: "/create", icon: Plus },
  { title: "Subscribers", url: "/subscribers", icon: Users },
  { title: "Earnings", url: "/earnings", icon: DollarSign },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-editorial rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-pure-white font-accent font-bold text-lg">M</span>
            </div>
            {!collapsed && <span className="font-inter text-xl font-bold text-foreground">Manus AI</span>}
          </Link>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="font-inter">Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 group ${
                        isActive(item.url) 
                          ? "bg-electric-purple text-pure-white shadow-sm" 
                          : "hover:bg-muted hover:scale-105"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 transition-colors ${isActive(item.url) ? 'text-pure-white' : 'text-muted-foreground group-hover:text-electric-purple'}`} />
                      {!collapsed && <span className="font-inter font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function MobileNavigation({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border shadow-lg">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center space-x-2" onClick={onClose}>
            <div className="w-8 h-8 bg-gradient-editorial rounded-lg flex items-center justify-center">
              <span className="text-pure-white font-accent font-bold text-lg">M</span>
            </div>
            <span className="font-inter text-xl font-bold text-foreground">Manus AI</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive(item.url)
                  ? "bg-electric-purple text-pure-white"
                  : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="font-inter font-medium">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Enhanced mock data with more realistic content
  const [newsletters, setNewsletters] = useState([
    {
      id: 1,
      title: "AI in Creative Writing: From Idea to Publication",
      status: "published",
      lastEdited: "2 hours ago",
      subscribers: 1234,
      type: "free",
      views: 2847,
      engagement: "high"
    },
    {
      id: 2,
      title: "The Future of Digital Marketing in 2024", 
      status: "draft",
      lastEdited: "1 day ago",
      subscribers: 0,
      type: "premium",
      views: 0,
      engagement: "none"
    },
    {
      id: 3,
      title: "Building Your Personal Brand: A Complete Guide",
      status: "scheduled",
      lastEdited: "3 days ago", 
      subscribers: 892,
      type: "free",
      views: 1523,
      engagement: "medium"
    },
    {
      id: 4,
      title: "Mastering Newsletter Monetization Strategies",
      status: "published",
      lastEdited: "5 days ago", 
      subscribers: 2156,
      type: "premium",
      views: 4231,
      engagement: "high"
    },
    {
      id: 5,
      title: "Weekly Tech Roundup #47",
      status: "published",
      lastEdited: "1 week ago", 
      subscribers: 3421,
      type: "free",
      views: 5632,
      engagement: "high"
    }
  ]);

  const handleAction = async (action: string, newsletterId: number, title: string) => {
    setLoadingAction(`${action}-${newsletterId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (action === 'delete') {
      setNewsletters(prev => prev.filter(n => n.id !== newsletterId));
      toast({
        title: "Newsletter deleted",
        description: `"${title}" has been permanently deleted.`,
      });
    } else if (action === 'view') {
      toast({
        title: "Opening newsletter",
        description: `Viewing "${title}"...`,
      });
    } else if (action === 'edit') {
      toast({
        title: "Opening editor",
        description: `Editing "${title}"...`,
      });
    }
    
    setLoadingAction(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-success text-success-foreground";
      case "draft": return "bg-muted text-muted-foreground";
      case "scheduled": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        
        {/* Mobile Navigation */}
        <MobileNavigation isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="border-b border-border bg-card sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
              <div className="flex items-center space-x-4">
                {/* Mobile menu trigger */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                
                {/* Desktop sidebar trigger */}
                <div className="hidden md:block">
                  <SidebarTrigger />
                </div>
                
                <div>
                  <h1 className="font-inter text-xl md:text-2xl font-bold text-foreground">My Newsletters</h1>
                  <p className="text-sm text-muted-foreground font-inter">Manage and track your newsletter content</p>
                </div>
              </div>
              <Link to="/create">
                <Button variant="default" className="group shrink-0">
                  <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Create Newsletter</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-4 md:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium font-inter">Total Newsletters</CardTitle>
                  <div className="p-2 bg-electric-purple/10 rounded-lg">
                    <FileText className="h-4 w-4 text-electric-purple" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-2xl font-bold font-inter mb-1">12</div>
                  <p className="text-xs text-success font-inter">+2 from last month</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium font-inter">Total Subscribers</CardTitle>
                  <div className="p-2 bg-electric-purple/10 rounded-lg">
                    <Users className="h-4 w-4 text-electric-purple" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-2xl font-bold font-inter mb-1">2,126</div>
                  <p className="text-xs text-success font-inter">+180 from last month</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium font-inter">Monthly Revenue</CardTitle>
                  <div className="p-2 bg-electric-purple/10 rounded-lg">
                    <DollarSign className="h-4 w-4 text-electric-purple" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-2xl font-bold font-inter mb-1">$1,247</div>
                  <p className="text-xs text-success font-inter">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium font-inter">Open Rate</CardTitle>
                  <div className="p-2 bg-electric-purple/10 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-electric-purple" />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="text-2xl font-bold font-inter mb-1">68.2%</div>
                  <p className="text-xs text-success font-inter">+4.1% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Newsletters */}
            <Card>
              <CardHeader>
                <CardTitle className="font-inter font-semibold">Recent Newsletters</CardTitle>
                <CardDescription className="font-inter">Your latest newsletter content and performance</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-inter font-medium">Title</TableHead>
                        <TableHead className="font-inter font-medium">Status</TableHead>
                        <TableHead className="font-inter font-medium">Type</TableHead>
                        <TableHead className="font-inter font-medium">Subscribers</TableHead>
                        <TableHead className="font-inter font-medium">Last Edited</TableHead>
                        <TableHead className="text-right font-inter font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newsletters.map((newsletter) => (
                        <TableRow key={newsletter.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium font-inter max-w-[300px] truncate">{newsletter.title}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(newsletter.status)}>
                              {newsletter.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={newsletter.type === "premium" ? "default" : "outline"}>
                              {newsletter.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-inter">{newsletter.subscribers.toLocaleString()}</TableCell>
                          <TableCell className="font-inter text-muted-foreground">{newsletter.lastEdited}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAction('view', newsletter.id, newsletter.title)}
                                disabled={loadingAction === `view-${newsletter.id}`}
                                className="hover:bg-electric-purple/10 hover:text-electric-purple transition-all duration-300"
                              >
                                {loadingAction === `view-${newsletter.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAction('edit', newsletter.id, newsletter.title)}
                                disabled={loadingAction === `edit-${newsletter.id}`}
                                className="hover:bg-electric-purple/10 hover:text-electric-purple transition-all duration-300"
                              >
                                {loadingAction === `edit-${newsletter.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Edit className="h-4 w-4" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-inter">Delete Newsletter</AlertDialogTitle>
                                    <AlertDialogDescription className="font-inter">
                                      Are you sure you want to delete "{newsletter.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="font-inter">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleAction('delete', newsletter.id, newsletter.title)}
                                      disabled={loadingAction === `delete-${newsletter.id}`}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {loadingAction === `delete-${newsletter.id}` ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          Deleting...
                                        </>
                                      ) : (
                                        'Delete'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {newsletters.map((newsletter) => (
                    <Card key={newsletter.id} className="border border-border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium font-inter text-sm leading-5">{newsletter.title}</h3>
                            <div className="flex space-x-1 ml-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAction('view', newsletter.id, newsletter.title)}
                                disabled={loadingAction === `view-${newsletter.id}`}
                                className="h-8 w-8 p-0 hover:bg-electric-purple/10 hover:text-electric-purple"
                              >
                                {loadingAction === `view-${newsletter.id}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAction('edit', newsletter.id, newsletter.title)}
                                disabled={loadingAction === `edit-${newsletter.id}`}
                                className="h-8 w-8 p-0 hover:bg-electric-purple/10 hover:text-electric-purple"
                              >
                                {loadingAction === `edit-${newsletter.id}` ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Edit className="h-3 w-3" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-inter">Delete Newsletter</AlertDialogTitle>
                                    <AlertDialogDescription className="font-inter">
                                      Are you sure you want to delete "{newsletter.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="font-inter">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleAction('delete', newsletter.id, newsletter.title)}
                                      disabled={loadingAction === `delete-${newsletter.id}`}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {loadingAction === `delete-${newsletter.id}` ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          Deleting...
                                        </>
                                      ) : (
                                        'Delete'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(newsletter.status)}>
                              {newsletter.status}
                            </Badge>
                            <Badge variant={newsletter.type === "premium" ? "default" : "outline"}>
                              {newsletter.type}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between text-sm text-muted-foreground font-inter">
                            <span>{newsletter.subscribers.toLocaleString()} subscribers</span>
                            <span>{newsletter.lastEdited}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
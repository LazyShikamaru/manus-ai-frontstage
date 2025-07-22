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
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  Settings, 
  BarChart3,
  Calendar,
  Edit,
  Eye,
  Trash2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-editorial rounded-lg flex items-center justify-center">
              <span className="text-pure-white font-accent font-bold text-lg">M</span>
            </div>
            {!collapsed && <span className="font-serif text-xl font-bold text-foreground">Manus AI</span>}
          </Link>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.url) 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="font-accent">{item.title}</span>}
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

const Dashboard = () => {
  // Mock data
  const newsletters = [
    {
      id: 1,
      title: "AI in Creative Writing",
      status: "published",
      lastEdited: "2 hours ago",
      subscribers: 1234,
      type: "free"
    },
    {
      id: 2,
      title: "The Future of Digital Marketing", 
      status: "draft",
      lastEdited: "1 day ago",
      subscribers: 0,
      type: "premium"
    },
    {
      id: 3,
      title: "Building Your Personal Brand",
      status: "scheduled",
      lastEdited: "3 days ago", 
      subscribers: 892,
      type: "free"
    }
  ];

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
        <DashboardSidebar />
        
        <main className="flex-1">
          {/* Header */}
          <header className="border-b border-border bg-card">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="font-serif text-2xl font-bold text-foreground">My Newsletters</h1>
                  <p className="text-muted-foreground">Manage and track your newsletter content</p>
                </div>
              </div>
              <Link to="/create">
                <Button className="group">
                  <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Create Newsletter
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,126</div>
                  <p className="text-xs text-muted-foreground">+180 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,247</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68.2%</div>
                  <p className="text-xs text-muted-foreground">+4.1% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Newsletters Table */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Recent Newsletters</CardTitle>
                <CardDescription>Your latest newsletter content and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Last Edited</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletters.map((newsletter) => (
                      <TableRow key={newsletter.id}>
                        <TableCell className="font-medium">{newsletter.title}</TableCell>
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
                        <TableCell>{newsletter.subscribers.toLocaleString()}</TableCell>
                        <TableCell>{newsletter.lastEdited}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
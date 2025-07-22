import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="p-6 bg-card rounded-2xl border border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="w-12 h-12 bg-gradient-editorial rounded-xl flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-pure-white" />
      </div>
      <h3 className="font-sans text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="font-sans text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group p-8 bg-card rounded-2xl border border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 bg-gradient-indigo rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-pure-white" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaVariant?: "default" | "outline";
}

const PricingCard = ({ 
  title, 
  price, 
  description, 
  features, 
  isPopular = false, 
  ctaText,
  ctaVariant = "default"
}: PricingCardProps) => {
  return (
    <div className={`relative p-8 bg-card rounded-2xl border-2 transition-all duration-300 hover:shadow-soft ${
      isPopular ? 'border-accent shadow-editorial' : 'border-border hover:-translate-y-1'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-editorial text-pure-white px-4 py-2 rounded-full text-sm font-accent font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="font-sans text-2xl font-bold text-foreground mb-2">{title}</h3>
        <div className="flex items-baseline justify-center mb-4">
          <span className="font-sans text-4xl font-bold text-foreground">{price}</span>
          {price !== "Free" && <span className="font-sans text-muted-foreground ml-2">/month</span>}
        </div>
        <p className="font-sans text-muted-foreground">{description}</p>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <span className="font-sans text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        variant={ctaVariant} 
        className="w-full"
        size="lg"
      >
        {ctaText}
      </Button>
    </div>
  );
};

export default PricingCard;
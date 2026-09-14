export interface TradeArchetype {
  key: string;
  label: string;
  features?: any;
}

export interface ArchetypeGroup {
  key: string;
  label: string;
  title: string;
  description: string;
  archetypes: TradeArchetype[];
}

export function getArchetypeGroups(): ArchetypeGroup[] {
  return [
    {
      key: "services",
      title: "Services",
      label: "Services",
      description: "Local personal and community services.",
      archetypes: [
        { key: "beauty_and_hair", label: "Hair & Beauty" },
        { key: "home_services", label: "Home Services & Cleaning" },
        { key: "fashion_and_clothing", label: "Fashion, Tailoring & Clothing" }
      ]
    },
    {
      key: "trades",
      title: "Trades",
      label: "Trades",
      description: "Construction, repairs, and mechanical trades.",
      archetypes: [
        { key: "construction_and_trades", label: "Construction & Building" },
        { key: "mechanic_auto", label: "Mechanic & Auto Repairs" },
        { key: "plumbing", label: "Plumbing Services" },
        { key: "electrical", label: "Electrical Repairs" }
      ]
    },
    {
      key: "commerce",
      title: "Commerce & Food",
      label: "Commerce & Food",
      description: "Retail stores, spazas, and catering.",
      archetypes: [
        { key: "retail_and_trading", label: "Retail & Trading (Spaza / Shop)" },
        { key: "food_and_catering", label: "Food, Bakery & Catering" },
        { key: "commission_based_sales", label: "Commission & Direct Sales" }
      ]
    },
    {
      key: "digital",
      title: "Digital & Professional",
      label: "Digital & Professional",
      description: "Tech, education, design, and events.",
      archetypes: [
        { key: "tech_and_digital", label: "Tech, IT & Web Design" },
        { key: "education_and_training", label: "Education, Tutoring & Training" },
        { key: "events_and_media", label: "Events, Sound & Media Production" }
      ]
    },
    {
      key: "mobility",
      title: "Mobility & Transport",
      label: "Mobility & Transport",
      description: "Transport, courier, and logistics.",
      archetypes: [
        { key: "transport_and_delivery", label: "Transport, Scholar & Delivery" }
      ]
    }
  ];
}

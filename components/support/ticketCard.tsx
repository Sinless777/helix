// components/support/ticketCard.tsx

import React from "react";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  onClick?: (ticketId: string) => void;
}

const statusColorMap: Record<TicketStatus, string> = {
  OPEN: "text-green-500",
  IN_PROGRESS: "text-yellow-500",
  RESOLVED: "text-blue-500",
  CLOSED: "text-gray-500",
};

/**
 * TicketCard component — displays a support ticket summary.
 * Glassmorphism effect (blur+transparency) plus Tailwind styling.
 */
export const TicketCard: React.FC<TicketCardProps> = ({
  id,
  title,
  description,
  status,
  createdAt,
  updatedAt,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div
      className="
        cursor-pointer
        p-6
        rounded-lg
        bg-white/10
        backdrop-blur-lg
        shadow-lg
        hover:bg-white/20
        transition
        duration-200
        ease-in-out
      "
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className={`${statusColorMap[status]} font-medium`}>
          {status.replace("_", " ")}
        </span>
      </div>

      <p className="text-sm text-white/80 mb-4 line-clamp-2">
        {description}
      </p>

      <div className="text-xs text-white/60 flex justify-between">
        <span>Created: {new Date(createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default TicketCard;

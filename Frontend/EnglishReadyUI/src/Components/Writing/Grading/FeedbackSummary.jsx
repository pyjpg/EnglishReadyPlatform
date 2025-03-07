import React from 'react';
import PropTypes from 'prop-types';

const FeedbackSummaryCard = ({ title, summary, actionLabel = "View Details", onClick, icon, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-800",
    green: "bg-green-50 border-green-100 text-green-800", 
    amber: "bg-amber-50 border-amber-100 text-amber-800",
    red: "bg-red-50 border-red-100 text-red-800",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-800"
  };
  
  return (
    <div className={`${colors[color]} border rounded-lg p-3 mb-3`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
      </div>
      <p className="text-sm mb-3">{summary}</p>
      <button 
        onClick={onClick}
        className="text-sm font-medium hover:underline inline-flex items-center"
      >
        {actionLabel}
        <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

FeedbackSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green', 'amber', 'red', 'yellow'])
};

export default FeedbackSummaryCard;
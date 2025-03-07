import React from 'react';
import PropTypes from 'prop-types';

const KeyImprovementItem = ({ text, priority = "medium" }) => {
  const colors = {
    high: { border: "border-red-300", dot: "bg-red-500" },
    medium: { border: "border-amber-300", dot: "bg-amber-500" },
    low: { border: "border-blue-300", dot: "bg-blue-500" }
  };
  
  return (
    <div className={`p-2.5 border ${colors[priority].border} rounded-lg mb-2 flex items-start`}>
      <div className={`${colors[priority].dot} w-2 h-2 mt-1 mr-2 rounded-full flex-shrink-0`}></div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
};

KeyImprovementItem.propTypes = {
  text: PropTypes.string.isRequired,
  priority: PropTypes.oneOf(['high', 'medium', 'low'])
};

export default KeyImprovementItem;